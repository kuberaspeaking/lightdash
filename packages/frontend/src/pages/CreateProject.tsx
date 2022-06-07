import { Icon, Intent, RadioGroup } from '@blueprintjs/core';
import { WarehouseTypes } from '@lightdash/common';
import React, { FC, useState } from 'react';
import { useForm } from 'react-hook-form';
import Page from '../components/common/Page/Page';
import PageSpinner from '../components/PageSpinner';
import { CreateProjectConnection } from '../components/ProjectConnection';
import { ProjectFormProvider } from '../components/ProjectConnection/ProjectFormProvider';
import Form from '../components/ReactHookForm/Form';
// import RadioGroup from '../components/ReactHookForm/RadioGroup';
import { useApp } from '../providers/AppProvider';
import {
    BackToWarehouseButton,
    ButtonLabel,
    ButtonsWrapper,
    Codeblock,
    ConnectWarehouseWrapper,
    CreateHeaderWrapper,
    CreateProjectWrapper,
    ExternalLink,
    LinkToDocsButton,
    RadioButton,
    SubmitButton,
    Subtitle,
    Title,
    WarehouseButton,
    WarehouseGrid,
    WarehouseIcon,
    Wrapper,
} from './CreateProject.styles';

const WarehouseTypeLabels = [
    { label: 'Bigquery', key: WarehouseTypes.BIGQUERY, icon: './bigquery.png' },
    {
        label: 'Databricks',
        key: WarehouseTypes.DATABRICKS,
        icon: './databricks.png',
    },
    {
        label: 'PostgreSQL',
        key: WarehouseTypes.POSTGRES,
        icon: './postgresql.png',
    },
    { label: 'Redshift', key: WarehouseTypes.REDSHIFT, icon: './redshift.png' },
    {
        label: 'Snowflake',
        key: WarehouseTypes.SNOWFLAKE,
        icon: './snowflake.png',
    },
];

export type SelectedWarehouse = {
    label: string;
    key: WarehouseTypes;
    icon: string;
};

interface WareHouseConnectCardProps {
    setWarehouse: (warehouse: SelectedWarehouse) => void;
}

interface HowToConnectDataCardProps {
    setHasDimensions: (dimension: 'yes' | 'no') => void;
}

const ConnectionOptions: FC<HowToConnectDataCardProps> = ({
    setHasDimensions,
}) => (
    <Wrapper>
        <ConnectWarehouseWrapper>
            <Title>You're in! 🎉</Title>
            <Subtitle>
                We strongly recommend that you define columns in your .yml file
                for a smoother experience. Don’t worry! You can do this right
                now:
            </Subtitle>
            <ButtonsWrapper>
                <LinkToDocsButton>
                    <ButtonLabel>By using our handy CLI tool</ButtonLabel>
                    <Icon icon="chevron-right" />
                </LinkToDocsButton>
                <LinkToDocsButton>
                    <ButtonLabel>...or by adding them manually.</ButtonLabel>
                    <Icon icon="chevron-right" />
                </LinkToDocsButton>
            </ButtonsWrapper>
            <SubmitButton
                type="submit"
                intent={Intent.PRIMARY}
                text="I’ve defined them!"
                onClick={() => setHasDimensions('yes')}
            />
        </ConnectWarehouseWrapper>
    </Wrapper>
);

const HowToConnectDataCard: FC<HowToConnectDataCardProps> = ({
    setHasDimensions,
}) => {
    const methods = useForm<{ hasDimension: 'yes' | 'no' }>();

    const onSubmit = (formData: { hasDimension: 'yes' | 'no' }) => {
        console.log(formData);
        setHasDimensions(formData?.hasDimension);
    };
    return (
        <Wrapper>
            <ConnectWarehouseWrapper>
                <Title>You're in! 🎉</Title>
                <Subtitle>
                    The next step is to connect your data. To see a table in
                    Lightdash, you need to define its columns in a .yml file.
                    eg:
                </Subtitle>
                <Codeblock>
                    <pre>
                        <code>
                            models: - name: my_model columns: - name:
                            my_column_1 - name: my_column_2
                        </code>
                    </pre>
                </Codeblock>
                <Form
                    name="has-dimensions-selector"
                    methods={methods}
                    onSubmit={onSubmit}
                    disableSubmitOnEnter
                >
                    <RadioGroup
                        name="hasDimension"
                        label="Have you defined dimensions in your .yml files?"
                        onChange={(e) => e.currentTarget.value}
                    >
                        <RadioButton label="Yes" value="yes" />
                        <RadioButton label="No" value="no" />
                    </RadioGroup>
                    <SubmitButton
                        type="submit"
                        intent={Intent.PRIMARY}
                        text="Next"
                    />
                </Form>
            </ConnectWarehouseWrapper>
        </Wrapper>
    );
};

const WareHouseConnectCard: FC<WareHouseConnectCardProps> = ({
    setWarehouse,
}) => {
    return (
        <Wrapper>
            <ConnectWarehouseWrapper>
                <Title>Connect your project</Title>
                <Subtitle>Select your warehouse:</Subtitle>
                <WarehouseGrid>
                    {WarehouseTypeLabels.map((item) => (
                        <WarehouseButton
                            key={item.key}
                            outlined
                            icon={
                                <WarehouseIcon src={item.icon} alt={item.key} />
                            }
                            onClick={() => setWarehouse(item)}
                        >
                            {item.label}
                        </WarehouseButton>
                    ))}
                </WarehouseGrid>
                <ExternalLink
                    href="https://demo.lightdash.com/"
                    target="_blank"
                >
                    ...or try our demo project instead
                </ExternalLink>
            </ConnectWarehouseWrapper>
        </Wrapper>
    );
};

const CreateProject: FC = () => {
    const { health } = useApp();
    const [selectedWarehouse, setSelectedWarehouse] = useState<
        SelectedWarehouse | undefined
    >();
    const [hasDimensions, setHasDimensions] = useState<
        'yes' | 'no' | undefined
    >();

    if (health.isLoading) {
        return <PageSpinner />;
    }
    console.log(hasDimensions);

    const PanelToRender = () => {
        switch (hasDimensions) {
            case 'yes':
                return (
                    <>
                        {!selectedWarehouse ? (
                            <WareHouseConnectCard
                                setWarehouse={setSelectedWarehouse}
                            />
                        ) : (
                            <CreateProjectWrapper>
                                <CreateHeaderWrapper>
                                    <BackToWarehouseButton
                                        icon="chevron-left"
                                        text="Back"
                                        onClick={() =>
                                            setSelectedWarehouse(undefined)
                                        }
                                    />
                                    <Title marginBottom>
                                        {`Create a ${selectedWarehouse.label} connection`}
                                    </Title>
                                </CreateHeaderWrapper>
                                <CreateProjectConnection
                                    selectedWarehouse={selectedWarehouse}
                                />
                            </CreateProjectWrapper>
                        )}
                    </>
                );
            case 'no':
                return (
                    <ConnectionOptions setHasDimensions={setHasDimensions} />
                );
            case undefined:
                return (
                    <HowToConnectDataCard setHasDimensions={setHasDimensions} />
                );
            default:
                return <></>;
        }
    };

    return (
        <Page
            hideFooter={!!selectedWarehouse}
            noContentPadding={!!selectedWarehouse}
        >
            <ProjectFormProvider>
                <PanelToRender />
            </ProjectFormProvider>
        </Page>
    );
};

export default CreateProject;
