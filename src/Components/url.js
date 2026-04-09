
const envBaseUrl = process.env.REACT_APP_RUTA_WEB;
const runtimeOrigin = typeof window !== 'undefined' ? window.location.origin : '';

const resolveBaseUrl = () => {
	if (envBaseUrl) {
		return envBaseUrl;
	}

	if (!runtimeOrigin) {
		return 'http://localhost:8081';
	}

	try {
		const currentUrl = new URL(runtimeOrigin);

		// En desarrollo, React corre en :3000 y la API PHP en :8081.
		if (currentUrl.port === '3000' || currentUrl.port === '5173') {
			currentUrl.port = '8081';
		}

		return currentUrl.toString();
	} catch (error) {
		return 'http://localhost:8081';
	}
};

const baseURL = resolveBaseUrl().replace(/\/$/, '');

export default baseURL;
