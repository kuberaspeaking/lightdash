import {
    ApiCreateUserTokenResults,
    ApiError,
    CreatePersonalAccessToken,
} from '@lightdash/common';
import { useMutation, useQuery } from 'react-query';
import { lightdashApi } from '../api';
import { useApp } from '../providers/AppProvider';
import useQueryError from './useQueryError';

// gets users access tokens
const getAccessToken = async () =>
    lightdashApi<any[]>({
        url: `/me/personal-access-tokens`,
        method: 'GET',
        body: undefined,
    });

const createAccessToken = async (data: CreatePersonalAccessToken) =>
    lightdashApi<ApiCreateUserTokenResults>({
        url: `/me/personal-access-tokens`,
        method: 'POST',
        body: JSON.stringify(data),
    });

// TBC
// const deleteAccessToken = async (tokenUuid: string) =>
//     lightdashApi<undefined>({
//         url: `/me//personal-access-tokens/${tokenUuid}`,
//         method: 'DELETE',
//         body: undefined,
//     });

export const useAccessToken = () => {
    const setErrorResponse = useQueryError();
    return useQuery<any[], ApiError>({
        queryKey: ['personal_access_tokens'],
        queryFn: () => getAccessToken(),
        retry: false,
        onError: (result) => setErrorResponse(result),
    });
};

export const useCreateAccessToken = () => {
    const { showToastError } = useApp();
    return useMutation<
        ApiCreateUserTokenResults,
        ApiError,
        CreatePersonalAccessToken
    >((data) => createAccessToken(data), {
        mutationKey: ['personal_access_tokens'],
        retry: 3,
        onSuccess: (data) => {
            console.log(data);
        },
        onError: (error) => {
            showToastError({
                title: `Failed to create token`,
                subtitle: error.error.message,
            });
        },
    });
};
