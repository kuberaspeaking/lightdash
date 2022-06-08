import { Intent, Radio } from '@blueprintjs/core';
import React, { FC } from 'react';
import { useForm } from 'react-hook-form';
import RadioGroup from '../../ReactHookForm/RadioGroup';
import {
    Codeblock,
    ConnectWarehouseWrapper,
    HasDimensionsForm,
    SubmitButton,
    Subtitle,
    Title,
    Wrapper,
} from './ProjectConnectFlow.styles';

interface Props {
    setHasDimensions: (dimension: string) => void;
}

const HowToConnectDataCard: FC<Props> = ({ setHasDimensions }) => {
    const methods = useForm<{ hasDimension: string }>({
        mode: 'onSubmit',
    });

    const onSubmit = (formData: { hasDimension: string }) => {
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
                        {/* <code> */}
                        models: - name: my_model columns: - name: my_column_1 -
                        name: my_column_2
                        {/* </code> */}
                    </pre>
                </Codeblock>
                <HasDimensionsForm
                    name="has-dimensions-selector"
                    methods={methods}
                    onSubmit={onSubmit}
                    disableSubmitOnEnter
                >
                    <RadioGroup
                        name="hasDimension"
                        label="Have you defined dimensions in your .yml files?"
                        rules={{
                            required: 'Required field',
                        }}
                    >
                        <Radio label="Yes" value="hasDimensions" />
                        <Radio label="No" value="doesNotHaveDimensions" />
                    </RadioGroup>
                    <SubmitButton
                        type="submit"
                        intent={Intent.PRIMARY}
                        text="Next"
                    />
                </HasDimensionsForm>
            </ConnectWarehouseWrapper>
        </Wrapper>
    );
};
export default HowToConnectDataCard;
