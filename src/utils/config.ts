const lenticularLensApi = '$REACT_APP_LENTICULAR_LENS_API';

export const api = () => getVar(lenticularLensApi);

function getVar(key: string): string {
    if (key.startsWith('$REACT_APP_'))
        // return key.substring(1) in process.env ? process.env[key.substring(1)] as string : '';
        return '';
    return key;
}
