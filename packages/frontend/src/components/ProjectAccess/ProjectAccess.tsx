import { Button, ButtonGroup, Classes, Dialog } from '@blueprintjs/core';
import { subject } from '@casl/ability';
import {
    OrganizationMemberProfile,
    OrganizationMemberRole,
    ProjectMemberProfile,
    ProjectMemberRole,
} from '@lightdash/common';
import { FC, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useOrganizationUsers } from '../../hooks/useOrganizationUsers';
import {
    useProjectAccess,
    useRevokeProjectAccessMutation,
    useUpdateProjectAccessMutation,
} from '../../hooks/useProjectAccess';
import { useApp } from '../../providers/AppProvider';
import { Can, useAbilityContext } from '../common/Authorization';
import {
    AddUserButton,
    ItemContent,
    OrgAccess,
    OrgAccessCounter,
    OrgAccessHeader,
    OrgAccessTitle,
    ProjectAccessWrapper,
    RoleSelectButton,
    SectionWrapper,
    Separator,
    UserEmail,
    UserInfo,
    UserListItemWrapper,
    UserName,
} from './ProjectAccess.tyles';

const UserListItem: FC<{
    key: string;
    user: OrganizationMemberProfile | ProjectMemberProfile;
    onDelete?: () => void;
    onUpdate?: (newRole: ProjectMemberRole) => void;
}> = ({
    key,
    user: { firstName, lastName, email, role },
    onDelete,
    onUpdate,
}) => {
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

    return (
        <UserListItemWrapper>
            <ItemContent>
                <SectionWrapper>
                    <UserInfo>
                        <UserName className={Classes.TEXT_OVERFLOW_ELLIPSIS}>
                            {firstName} {lastName}
                        </UserName>
                        {email && <UserEmail minimal>{email}</UserEmail>}
                    </UserInfo>

                    <ButtonGroup>
                        {onUpdate ? (
                            <RoleSelectButton
                                fill
                                id="user-role"
                                options={Object.values(ProjectMemberRole).map(
                                    (orgMemberRole) => ({
                                        value: orgMemberRole,
                                        label: orgMemberRole,
                                    }),
                                )}
                                required
                                onChange={(e) => {
                                    const newRole = e.target
                                        .value as ProjectMemberRole;
                                    onUpdate(newRole);
                                }}
                                value={role}
                            />
                        ) : (
                            <p>{role}</p>
                        )}
                        {onDelete && (
                            <Button
                                icon="delete"
                                intent="danger"
                                outlined
                                onClick={() => setIsDeleteDialogOpen(true)}
                                text="Delete"
                            />
                        )}
                    </ButtonGroup>
                </SectionWrapper>
            </ItemContent>
            <Dialog
                isOpen={isDeleteDialogOpen}
                icon="key"
                onClose={() => setIsDeleteDialogOpen(false)}
                title="Revoke project access"
                lazy
                canOutsideClickClose={false}
            >
                <div className={Classes.DIALOG_BODY}>
                    <p>
                        Are you sure you want to revoke project access this user{' '}
                        {email} ?
                    </p>
                </div>
                <div className={Classes.DIALOG_FOOTER}>
                    <div className={Classes.DIALOG_FOOTER_ACTIONS}>
                        <Button onClick={() => setIsDeleteDialogOpen(false)}>
                            Cancel
                        </Button>
                        <Button intent="danger" onClick={onDelete}>
                            Delete
                        </Button>
                    </div>
                </div>
            </Dialog>
        </UserListItemWrapper>
    );
};
const ProjectAccess: FC<{
    onAddUser: () => void;
}> = ({ onAddUser }) => {
    const { user } = useApp();
    const ability = useAbilityContext();
    const { projectUuid } = useParams<{ projectUuid: string }>();
    const { mutate: revokeAccess } =
        useRevokeProjectAccessMutation(projectUuid);
    const { mutate: updateAccess } =
        useUpdateProjectAccessMutation(projectUuid);

    const { data: projectMemberships } = useProjectAccess(projectUuid);
    const { data: organizationUsers } = useOrganizationUsers();

    const projectMemberEmails = projectMemberships?.map(
        (projectMember) => projectMember.email,
    );

    const inheritedPermissions = organizationUsers?.filter(
        (orgUser) =>
            !projectMemberEmails?.includes(orgUser.email) &&
            orgUser.role !== OrganizationMemberRole.MEMBER,
    );

    const canManageProjectAccess = ability.can(
        'manage',
        subject('Project', {
            organizationUuid: user.data?.organizationUuid,
            projectUuid,
        }),
    );

    return (
        <ProjectAccessWrapper>
            {projectMemberships?.map((projectMember) => (
                <UserListItem
                    key={projectMember.email}
                    user={projectMember}
                    onUpdate={
                        canManageProjectAccess
                            ? (newRole) =>
                                  updateAccess({
                                      userUuid: projectMember.userUuid,
                                      role: newRole,
                                  })
                            : undefined
                    }
                    onDelete={
                        canManageProjectAccess
                            ? () => revokeAccess(projectMember.userUuid)
                            : undefined
                    }
                />
            ))}
            <Can
                I={'manage'}
                this={subject('Project', {
                    organizationUuid: user.data?.organizationUuid,
                    projectUuid,
                })}
            >
                <AddUserButton
                    intent="primary"
                    onClick={onAddUser}
                    text="Add user"
                />
            </Can>
            {inheritedPermissions && (
                <OrgAccess>
                    <OrgAccessHeader>
                        <OrgAccessTitle>Inherited permissions</OrgAccessTitle>
                        <OrgAccessCounter>
                            {inheritedPermissions.length} can see this project
                        </OrgAccessCounter>
                    </OrgAccessHeader>
                    <Separator />

                    {inheritedPermissions?.map((orgUser) => (
                        <UserListItem key={orgUser.email} user={orgUser} />
                    ))}
                </OrgAccess>
            )}
        </ProjectAccessWrapper>
    );
};

export default ProjectAccess;