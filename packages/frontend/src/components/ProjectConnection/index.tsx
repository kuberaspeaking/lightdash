import { Button, Card, Colors, H5, Intent } from '@blueprintjs/core';
import {
    CreateWarehouseCredentials,
    DbtProjectConfig,
    friendlyName,
    ProjectType,
} from '@lightdash/common';
import React, { FC, useEffect } from 'react';
import { FieldErrors, useForm } from 'react-hook-form';
import { SubmitErrorHandler } from 'react-hook-form/dist/types/form';
import { useHistory } from 'react-router-dom';
import { useOrganisation } from '../../hooks/organisation/useOrganisation';
import {
    useCreateMutation,
    useProject,
    useUpdateMutation,
} from '../../hooks/useProject';
import { SelectedWarehouse } from '../../pages/CreateProject';
import { useApp } from '../../providers/AppProvider';
import { useTracking } from '../../providers/TrackingProvider';
import { EventName } from '../../types/Events';
import DocumentationHelpButton from '../DocumentationHelpButton';
import Form from '../ReactHookForm/Form';
import Input from '../ReactHookForm/Input';
import DbtSettingsForm from './DbtSettingsForm';
import {
    CompileProjectButton,
    CompileProjectWrapper,
    FormContainer,
    FormWrapper,
    WarehouseLogo,
} from './ProjectConnection.styles';
import { ProjectFormProvider } from './ProjectFormProvider';
import ProjectStatusCallout from './ProjectStatusCallout';
import WarehouseSettingsForm from './WarehouseSettingsForm';

type ProjectConnectionForm = {
    name: string;
    dbt: DbtProjectConfig;
    warehouse?: CreateWarehouseCredentials;
};

interface Props {
    showGeneralSettings: boolean;
    disabled: boolean;
    defaultType?: ProjectType;
    selectedWarehouse?: SelectedWarehouse | undefined;
}

const ProjectForm: FC<Props> = ({
    showGeneralSettings,
    disabled,
    defaultType,
    selectedWarehouse,
}) => (
    <>
        {showGeneralSettings && (
            <Card
                style={{
                    marginBottom: '20px',
                    display: 'flex',
                    flexDirection: 'row',
                    gap: 20,
                }}
                elevation={1}
            >
                <div style={{ flex: 1 }}>
                    <div
                        style={{
                            marginBottom: 15,
                        }}
                    >
                        <H5 style={{ display: 'inline', marginRight: 5 }}>
                            General settings
                        </H5>
                    </div>
                </div>
                <div style={{ flex: 1 }}>
                    <Input
                        name="name"
                        label="Project name"
                        rules={{
                            required: 'Required field',
                        }}
                        disabled={disabled}
                    />
                </div>
            </Card>
        )}
        <Card
            style={{
                marginBottom: '20px',
                display: 'flex',
                flexDirection: 'row',
            }}
            elevation={1}
        >
            <div style={{ flex: 1 }}>
                {selectedWarehouse && (
                    <WarehouseLogo
                        src={selectedWarehouse.icon}
                        alt={selectedWarehouse.key}
                    />
                )}
                <div>
                    <H5 style={{ display: 'inline', marginRight: 5 }}>
                        Warehouse connection
                    </H5>
                    <DocumentationHelpButton url="https://docs.lightdash.com/get-started/setup-lightdash/connect-project#warehouse-connection" />
                </div>
            </div>
            <div style={{ flex: 1 }}>
                <WarehouseSettingsForm
                    disabled={disabled}
                    selectedWarehouse={selectedWarehouse}
                />
            </div>
        </Card>
        <Card
            style={{
                marginBottom: '20px',
                display: 'flex',
                flexDirection: 'row',
                gap: 20,
            }}
            elevation={1}
        >
            <div style={{ flex: 1 }}>
                <div
                    style={{
                        marginBottom: 15,
                    }}
                >
                    <WarehouseLogo src="./dbt.png" alt="dbt icon" />
                    <div>
                        <H5
                            style={{
                                display: 'inline',
                                marginRight: 5,
                            }}
                        >
                            dbt connection
                        </H5>
                        <DocumentationHelpButton url="https://docs.lightdash.com/get-started/setup-lightdash/connect-project" />
                    </div>
                </div>

                <p style={{ color: Colors.GRAY1 }}>
                    Your dbt project must be compatible with{' '}
                    <a
                        href="https://docs.getdbt.com/docs/guides/migration-guide/upgrading-to-1-0-0"
                        target="_blank"
                        rel="noreferrer"
                    >
                        dbt version <b>1.0.0</b>
                    </a>
                </p>
            </div>
            <div style={{ flex: 1 }}>
                <DbtSettingsForm
                    disabled={disabled}
                    defaultType={defaultType}
                />
            </div>
        </Card>
    </>
);

const useOnProjectError = (): SubmitErrorHandler<ProjectConnectionForm> => {
    const { showToastError } = useApp();
    return async (errors: FieldErrors<ProjectConnectionForm>) => {
        if (!errors) {
            showToastError({
                title: 'Form error',
                subtitle: 'Unexpected error, please contact support',
            });
        } else {
            const errorMessages: string[] = Object.values(errors).reduce<
                string[]
            >((acc, section) => {
                const sectionErrors = Object.entries(section || {}).map(
                    ([key, { message }]) => `${friendlyName(key)}: ${message}`,
                );
                return [...acc, ...sectionErrors];
            }, []);
            showToastError({
                title: 'Form errors',
                subtitle: errorMessages.join('\n\n'),
            });
        }
    };
};

export const UpdateProjectConnection: FC<{ projectUuid: string }> = ({
    projectUuid,
}) => {
    const { user } = useApp();
    const { data } = useProject(projectUuid);
    const onError = useOnProjectError();
    const updateMutation = useUpdateMutation(projectUuid);
    const { isLoading: isSaving, mutateAsync, isIdle } = updateMutation;

    const methods = useForm<ProjectConnectionForm>({
        shouldUnregister: true,
        defaultValues: {
            name: data?.name,
            dbt: data?.dbtConnection,
            warehouse: data?.warehouseConnection,
        },
    });
    const { reset } = methods;
    useEffect(() => {
        if (data) {
            reset({
                name: data.name,
                dbt: data.dbtConnection,
                warehouse: data.warehouseConnection,
            });
        }
    }, [reset, data]);
    const { track } = useTracking();

    const onSubmit = async ({
        name,
        dbt: dbtConnection,
        warehouse: warehouseConnection,
    }: Required<ProjectConnectionForm>) => {
        if (user.data) {
            track({
                name: EventName.UPDATE_PROJECT_BUTTON_CLICKED,
            });
            await mutateAsync({
                name,
                dbtConnection,
                warehouseConnection,
            });
        }
    };

    return (
        <Form
            name="update_project"
            methods={methods}
            onSubmit={onSubmit}
            onError={onError}
        >
            <ProjectFormProvider savedProject={data}>
                <ProjectForm showGeneralSettings disabled={isSaving} />
            </ProjectFormProvider>
            {!isIdle && (
                <ProjectStatusCallout
                    style={{ marginBottom: '20px' }}
                    mutation={updateMutation}
                />
            )}
            <Button
                type="submit"
                intent={Intent.PRIMARY}
                text="Test & save connection"
                loading={isSaving}
                style={{ float: 'right' }}
            />
        </Form>
    );
};

interface CreateProjectConnectionProps {
    selectedWarehouse?: SelectedWarehouse | undefined;
}

export const CreateProjectConnection: FC<CreateProjectConnectionProps> = ({
    selectedWarehouse,
}) => {
    const history = useHistory();
    const { user, health, activeJobIsRunning, activeJob } = useApp();
    const onError = useOnProjectError();
    const createMutation = useCreateMutation();
    const { isLoading: isSaving, mutateAsync } = createMutation;
    const methods = useForm<ProjectConnectionForm>({
        shouldUnregister: true,
        defaultValues: {
            name: user.data?.organizationName,
            dbt: health.data?.defaultProject,
        },
    });
    const { track } = useTracking();

    const onSubmit = async ({
        name,
        dbt: dbtConnection,
        warehouse: warehouseConnection,
    }: Required<ProjectConnectionForm>) => {
        track({
            name: EventName.CREATE_PROJECT_BUTTON_CLICKED,
        });
        await mutateAsync({
            name: name || user.data?.organizationName || 'My project',
            dbtConnection,
            warehouseConnection,
        });
    };

    useEffect(() => {
        if (activeJob?.jobResults?.projectUuid) {
            history.push({
                pathname: `/createProjectSettings/${activeJob?.jobResults?.projectUuid}`,
            });
        }
    }, [activeJob, history]);
    const { data: orgData } = useOrganisation();

    return (
        <FormContainer
            name="create_project"
            methods={methods}
            onSubmit={onSubmit}
            onError={onError}
        >
            <ProjectFormProvider>
                <FormWrapper>
                    <ProjectForm
                        showGeneralSettings={!orgData?.needsProject}
                        disabled={isSaving || !!activeJobIsRunning}
                        defaultType={health.data?.defaultProject?.type}
                        selectedWarehouse={selectedWarehouse}
                    />
                </FormWrapper>
            </ProjectFormProvider>
            <CompileProjectWrapper>
                <FormWrapper>
                    <CompileProjectButton
                        type="submit"
                        intent={Intent.PRIMARY}
                        text="Test &amp; compile project"
                        loading={isSaving || activeJobIsRunning}
                    />
                </FormWrapper>
            </CompileProjectWrapper>
        </FormContainer>
    );
};
