const lenticularLensApi = '$VITE_LENTICULAR_LENS_API';

export const api = getVar(lenticularLensApi);
export const isProd = import.meta.env.MODE === 'production';

function getVar(key: string): string {
    if (key.startsWith('$VITE_'))
        return key.substring(1) in import.meta.env ? import.meta.env[key.substring(1)] : '';
    return key;
}
