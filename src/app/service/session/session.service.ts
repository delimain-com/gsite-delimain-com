import {Injectable, WritableSignal} from '@angular/core';
import {injectLocalStorage} from "ngxtension/inject-local-storage";

@Injectable({
	providedIn: 'root',
})
export class SessionService {

	public $session: WritableSignal<any> = injectLocalStorage('session');

	set(session: any): void {
		this.$session.set(session);
	}

	get(): any {
		return this.$session();
	}

}
