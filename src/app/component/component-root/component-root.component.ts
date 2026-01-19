import {Component, DestroyRef, inject, signal, WritableSignal} from '@angular/core';
import {FormsModule} from "@angular/forms";
import LoginComponent from "../login/login.component";
import {SessionService} from "../../service/session/session.service";
import {AuthService} from "../../service/auth/auth.service";
import {takeUntilDestroyed} from "@angular/core/rxjs-interop";
import {take, tap} from "rxjs";
import {injectParams} from "ngxtension/inject-params";
import LayoutComponent from "../layout/layout.component";

@Component({
	selector: 'app-component-root',
	imports: [
		FormsModule,
		LoginComponent,
		LayoutComponent
	],
	templateUrl: './component-root.component.html',
	styleUrl: './component-root.component.scss',
	host: {class: 'p-0 m-0'}
})
export default class ComponentRootComponent {

	#DestroyRef: DestroyRef = inject(DestroyRef);

	private auth: AuthService = inject(AuthService);

	private session: SessionService = inject(SessionService);

	public $domain = injectParams('domain');

	public $session = this.session.$session;

	public $isReady: WritableSignal<boolean> = signal(false);

	constructor() {
		this.auth.check()
			.pipe(takeUntilDestroyed(this.#DestroyRef))
			.pipe(tap(() => this.$isReady.set(true)))
			.pipe(take(1))
			.subscribe();
	}

}
