import React, {useEffect} from "react";
import LoadingScreen from "~/app/ui/components/LoadingScreen";
import MainScreen from "~/app/ui/components/MainScreen";

const UIRoot: React.FC = () => {
	useEffect(() => {
		const match = window.matchMedia("(prefers-color-scheme: dark)");

		const setColorTheme = (theme: 'light' | 'dark'): void => {
			if (theme === 'dark') {
				document.body.className = 'dark-theme';
			} else {
				document.body.className = 'light-theme';
			}
		}

		const themeListener = (): void => {
			setColorTheme(match.matches ? "dark" : "light");
		};
		themeListener();

		match.addEventListener('change', themeListener);

		return () => {
			match.removeEventListener('change', themeListener);
		}
	}, []);

	return <>
		<MainScreen/>
		<LoadingScreen/>
	</>;
}

export default UIRoot;