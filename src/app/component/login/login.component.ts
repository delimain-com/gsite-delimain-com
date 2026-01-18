import {Component, inject, OnInit, signal, WritableSignal} from '@angular/core';
import {FormsModule} from "@angular/forms";
import {ApiService} from "../../service/api/api.service";
import {take, tap} from "rxjs";
import {AuthService} from "../../service/auth/auth.service";
import {environment} from "../../../environments/environment";

@Component({
	selector: 'app-login',
	imports: [
		FormsModule
	],
	templateUrl: './login.component.html',
	styleUrl: './login.component.scss',
})
export default class LoginComponent  {

	public $isReady: WritableSignal<boolean> = signal(false);
	public $isWait: WritableSignal<boolean> = signal(false);

	public id: string = environment.id;
	public password: string = environment.password;

	private api: ApiService = inject(ApiService);
	private auth: AuthService = inject(AuthService);

	constructor() {
		this.$isReady.set(true);
	}

	action_login(): void {
		const params: any = {
			id: this.id,
			password: this.password,
		};
		this.$isWait.set(true);
		this.auth.login(params)
			.pipe(take(1))
			.pipe(tap(() => this.$isWait.set(false)))
			.subscribe();
	}

	action_test(): void {
		this.api.post('fn/siteInfo/load_siteList')
			.pipe(take(1))
			.subscribe();
	}

}
