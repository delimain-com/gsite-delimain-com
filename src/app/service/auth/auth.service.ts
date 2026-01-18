import {inject, Injectable} from '@angular/core';
import {ApiService} from "../api/api.service";
import {Observable, take, tap} from "rxjs";
import {SessionService} from "../session/session.service";

@Injectable({
	providedIn: 'root',
})
export class AuthService {

	private session: SessionService = inject(SessionService);

	private $session = this.session.$session;

	private api: ApiService = inject(ApiService);

	login(params: any = {}): Observable<any> {
		return this.api.post('fn/auth/login', params, {ignore_auth: true})
			.pipe(tap(({results}) => {
				const auth = results.auth || {};
				this.$session.set({auth});
			}));
	}

	check(): Observable<any> {
		const {auth} = this.$session() || {};
		const params: any = {auth};
		return this.api.post('fn/auth/check', params, {ignore_auth: true})
			.pipe(tap(({results}) => {
				const auth = results.auth || {};
				this.$session.set({auth});
			}));
	}

	logout(): Observable<any> {
		const {auth} = this.$session();
		const params: any = {auth};
		this.$session.set(null);
		return this.api.post('fn/auth/logout', params, {ignore_auth: true});
	}
}
