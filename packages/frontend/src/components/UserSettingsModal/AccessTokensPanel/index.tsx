import {
    Button,
    ButtonGroup,
    Classes,
    Dialog,
    Intent,
} from '@blueprintjs/core';
import { PersonalAccessToken } from '@lightdash/common';
import React, { FC, useState } from 'react';
import { useHistory, useParams } from 'react-router-dom';
import { useAccessToken } from '../../../hooks/useAccessToken';
import { useApp } from '../../../providers/AppProvider';
import { TrackPage } from '../../../providers/TrackingProvider';
import CreateTokenPanel from '../CreateTokenPanel';
import {
    HeaderActions,
    ItemContent,
    AccessTokenInfo,
    AccessTokenWrapper,
    AccessTokensPanelWrapper,
    AccessTokenLabel,
    ExpireAtLabel,
} from './AccessTokens.styles';

const TokenListItem: FC<{
    token: PersonalAccessToken;
}> = ({ token }) => {
    const { description, expiresAt, uuid } = token;
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const isDeleting = false;
    return (
        <AccessTokenWrapper elevation={0}>
            <ItemContent>
                <AccessTokenInfo>
                    <AccessTokenLabel
                        className={Classes.TEXT_OVERFLOW_ELLIPSIS}
                    >
                        {description}
                    </AccessTokenLabel>
                    <ExpireAtLabel intent={expiresAt ? 'warning' : 'none'}>
                        {expiresAt
                            ? `Expires on ${expiresAt}`
                            : 'No expiration date'}
                    </ExpireAtLabel>
                </AccessTokenInfo>
                <ButtonGroup>
                    <Button
                        icon="delete"
                        outlined
                        text="Delete"
                        intent={Intent.DANGER}
                        style={{ marginLeft: 10 }}
                        onClick={() => setIsDeleteDialogOpen(true)}
                    />
                </ButtonGroup>
            </ItemContent>
            <Dialog
                isOpen={isDeleteDialogOpen}
                icon="delete"
                onClose={() =>
                    !isDeleting ? setIsDeleteDialogOpen(false) : undefined
                }
                title={'Delete project ' + name}
                lazy
                canOutsideClickClose={false}
            >
                <div className={Classes.DIALOG_BODY}>
                    <p>
                        Are you sure ? This will permanently delete the
                        <b> {description} </b> token.
                    </p>
                </div>
                <div className={Classes.DIALOG_FOOTER}>
                    <div className={Classes.DIALOG_FOOTER_ACTIONS}>
                        <Button
                            disabled={isDeleting}
                            onClick={() => setIsDeleteDialogOpen(false)}
                        >
                            Cancel
                        </Button>
                        <Button
                            disabled={isDeleting}
                            intent="danger"
                            onClick={() => {
                                //  mutate(uuid);
                                window.location.href = '/';
                            }}
                        >
                            Delete
                        </Button>
                    </div>
                </div>
            </Dialog>
        </AccessTokenWrapper>
    );
};

const AccessTokensPanel: FC = () => {
    const { user } = useApp();
    const { data } = useAccessToken();
    const history = useHistory();
    console.log({ user, data });
    const [createTokenPanel, setCreateInvitesPanel] = useState(false);

    if (createTokenPanel) {
        return (
            <CreateTokenPanel
                onBackClick={() => setCreateInvitesPanel(false)}
            />
        );
    }

    return (
        <AccessTokensPanelWrapper>
            <HeaderActions>
                <Button
                    intent="primary"
                    onClick={() => setCreateInvitesPanel(true)}
                    text="Generate new token"
                />
            </HeaderActions>
            <div>
                {/* {data?.map((token) => (
                    <>
                        <TokenListItem key={token.uuid} token={token} />
                    </>
                ))} */}
            </div>
        </AccessTokensPanelWrapper>
    );
};

export default AccessTokensPanel;
