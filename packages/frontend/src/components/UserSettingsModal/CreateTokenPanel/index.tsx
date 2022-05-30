import { Button, Card, InputGroup, Intent } from '@blueprintjs/core';
import { CreatePersonalAccessToken, formatTimestamp } from '@lightdash/common';
import React, { FC, useEffect } from 'react';
import CopyToClipboard from 'react-copy-to-clipboard';
import { useForm } from 'react-hook-form';
import { useCreateAccessToken } from '../../../hooks/useAccessToken';
import { useApp } from '../../../providers/AppProvider';

import {
    BackButton,
    EmailInput,
    InvitedCallout,
    InviteForm,
    InviteFormGroup,
    Panel,
    RoleSelectButton,
    ShareLinkCallout,
    SubmitButton,
} from './CreateTokens.styles';

const CreateTokenPanel: FC<{
    onBackClick: () => void;
}> = ({ onBackClick }) => {
    const { showToastSuccess, health } = useApp();
    const { data, mutate, isError, isLoading, isSuccess } =
        useCreateAccessToken();
    const methods = useForm<Omit<CreatePersonalAccessToken, 'expiresAt'>>({
        mode: 'onSubmit',
    });
    console.log(data);

    useEffect(() => {
        if (isError) {
            methods.reset({ ...methods.getValues() }, { keepValues: true });
        }
        if (isSuccess) {
        }
    }, [isError, methods, isSuccess]);

    const handleSubmit = (formData: CreatePersonalAccessToken) => {
        mutate(formData);
    };

    return (
        <Panel>
            <BackButton
                icon="chevron-left"
                text="Back to all tokens"
                onClick={onBackClick}
            />
            <Card>
                <InviteForm
                    name="generate-token"
                    methods={methods}
                    onSubmit={handleSubmit}
                >
                    <EmailInput
                        name="description"
                        label="What’s this token for?"
                        disabled={isLoading}
                        rules={{
                            required: 'Required field',
                        }}
                    />

                    <SubmitButton
                        intent={Intent.PRIMARY}
                        text={'Generate token'}
                        type="submit"
                        disabled={isLoading}
                    />
                </InviteForm>
            </Card>
            {data && (
                <InviteFormGroup
                    label={
                        data?.token ? undefined : (
                            <span>
                                <b>Your token</b> has been generated
                            </span>
                        )
                    }
                    labelFor="invite-link-input"
                >
                    {data?.token && (
                        <InvitedCallout intent="success">
                            Your token has been generated.
                        </InvitedCallout>
                    )}
                    <InputGroup
                        id="invite-link-input"
                        className="cohere-block"
                        type="text"
                        readOnly
                        value={data.token}
                        rightElement={
                            <CopyToClipboard
                                text={data.token}
                                options={{ message: 'Copied' }}
                                onCopy={() =>
                                    showToastSuccess({
                                        title: 'Invite link copied',
                                    })
                                }
                            >
                                <Button minimal icon="clipboard" />
                            </CopyToClipboard>
                        }
                    />
                    {/* <ShareLinkCallout intent="primary">
                       
                        <b>{formatTimestamp(data.expiresAt)}</b>
                    </ShareLinkCallout> */}
                </InviteFormGroup>
            )}
        </Panel>
    );
};

export default CreateTokenPanel;
