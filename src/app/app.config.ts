import {ApplicationConfig, provideBrowserGlobalErrorListeners} from '@angular/core';
import {provideRouter, withComponentInputBinding, withHashLocation, withRouterConfig} from '@angular/router';

import {routes} from './app.routes';

export const appConfig: ApplicationConfig = {
	providers: [
		provideBrowserGlobalErrorListeners(),
		provideRouter(
			routes,
			withHashLocation(),
			withRouterConfig({
				onSameUrlNavigation: 'reload'
			}),
		)
	]
};
