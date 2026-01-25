import {Injectable, signal} from '@angular/core';

@Injectable({
	providedIn: 'root',
})
export class NoimageService {
	readonly transparent = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=';
}
