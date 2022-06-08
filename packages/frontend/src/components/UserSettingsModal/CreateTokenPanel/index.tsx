import { Button, Card, InputGroup, Intent } from '@blueprintjs/core';
import { CreatePersonalAccessToken, formatTimestamp } from '@lightdash/common';
import React, { FC, useEffect, useState } from 'react';
import CopyToClipboard from 'react-copy-to-clipboard';
import { useForm } from 'react-hook-form';
import { useCreateAccessToken } from '../../../hooks/useAccessToken';
import { useApp } from '../../../providers/AppProvider';
import {
    AccessTokenForm,
    BackButton,
    ExpireDateSelect,
    InvitedCallout,
    InviteFormGroup,
    Panel,
    ShareLinkCallout,
    SubmitButton,
    TokeDescriptionInput,
} from './CreateTokens.styles';

const CreateTokenPanel: FC<{
    onBackClick: () => void;
}> = ({ onBackClick }) => {
    const { showToastSuccess } = useApp();
    const { data, mutate, isError, isLoading, isSuccess } =
        useCreateAccessToken();

    const [expireDate, setExpireDate] = useState<Date | undefined>();

    const methods = useForm<CreatePersonalAccessToken>({
        mode: 'onSubmit',
    });

    useEffect(() => {
        if (isError) {
            methods.reset({ ...methods.getValues() }, { keepValues: true });
        }
    }, [isError, methods, isSuccess]);

    const handleSubmit = (formData: CreatePersonalAccessToken) => {
        const currentDate = new Date();
        const expiredValue = !!Number(formData?.expiresAt)
            ? new Date(
                  currentDate.setDate(
                      currentDate.getDate() + Number(formData?.expiresAt),
                  ),
              )
            : undefined;
        setExpireDate(expiredValue);

        mutate({
            description: formData.description,
            expiresAt: expiredValue,
        });
    };

    const expireOptions = [
        {
            label: 'No expiration',
            value: '',
        },
        {
            label: '7 days',
            value: 7,
        },
        {
            label: '30 days',
            value: 30,
        },
        {
            label: '60 days',
            value: 60,
        },
        {
            label: '90 days',
            value: 90,
        },
    ];

    return (
        <Panel>
            <BackButton
                icon="chevron-left"
                text="Back to all tokens"
                onClick={onBackClick}
            />
            <Card>
                <AccessTokenForm
                    name="generate-token"
                    methods={methods}
                    onSubmit={handleSubmit}
                >
                    <TokeDescriptionInput
                        name="description"
                        label="What’s this token for?"
                        disabled={isLoading}
                        rules={{
                            required: 'Required field',
                        }}
                    />
                    <ExpireDateSelect
                        name="expiresAt"
                        options={expireOptions}
                    />
                    <SubmitButton
                        intent={Intent.PRIMARY}
                        text={'Generate token'}
                        type="submit"
                        disabled={isLoading}
                    />
                </AccessTokenForm>
            </Card>
            {data && (
                <InviteFormGroup labelFor="invite-link-input">
                    {data.token && (
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
                                        title: 'Token copied',
                                    })
                                }
                            >
                                <Button minimal icon="clipboard" />
                            </CopyToClipboard>
                        }
                    />
                    <ShareLinkCallout intent="primary">
                        {expireDate &&
                            `This token will expire on
                        ${formatTimestamp(expireDate)} `}
                        Make sure to copy your personal access token now. You
                        won’t be able to see it again!
                    </ShareLinkCallout>
                </InviteFormGroup>
            )}
        </Panel>
    );
};

export default CreateTokenPanel;
