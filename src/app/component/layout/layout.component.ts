import {Component, DestroyRef, inject, Signal, signal, WritableSignal} from '@angular/core';
import {RouteReuseStrategy, RouterLink, RouterOutlet} from "@angular/router";
import {AuthService} from "../../service/auth/auth.service";
import {take, tap} from "rxjs";
import {takeUntilDestroyed} from "@angular/core/rxjs-interop";
import {SiteInfoService} from "../../service/site-info/site-info.service";
import {injectQueryParams} from "ngxtension/inject-query-params";
import SiteListComponent from "../page/site-list/site-list.component";
import ElNotifyMessageComponent from "../el/el-notify-message/el-notify-message.component";
import {NotifyMessageService} from "../../service/notify-message/notify-message.service";
import {injectNavigationEnd} from "ngxtension/navigation-end";

@Component({
	selector: 'app-layout',
	imports: [
		RouterOutlet,
		RouterLink,
		SiteListComponent,
		ElNotifyMessageComponent
	],
	templateUrl: './layout.component.html',
	styleUrl: './layout.component.scss'
})
export default class LayoutComponent {

	#DestroyRef: DestroyRef = inject(DestroyRef);

	private readonly reuseStrategy = inject(RouteReuseStrategy);

	private auth: AuthService = inject(AuthService);

	public siteInfo: SiteInfoService = inject(SiteInfoService);

	public $isReady: WritableSignal<boolean> = signal(false);
	public $isView: WritableSignal<boolean> = signal(true);

	public $menuList: WritableSignal<any> = signal([
		{path: 'home', label: 'ホーム'},
		{path: 'siteList', label: 'サイト一覧'},
		{path: 'castAdd', label: 'キャスト追加'},
		{path: 'castList', label: 'キャスト一覧'},
		{path: 'castScheduleDatetimeList', label: 'スケジュール'},
		{path: 'infoAdd', label: '新着追加'},
		{path: 'infoList', label: '新着一覧'},
		{path : 'eventAdd',label : 'イベント追加'},
		{path : 'eventList',label : 'イベント一覧'}
	]);

	public $domain: Signal<any> = injectQueryParams('domain');

	public notifyMessage: NotifyMessageService = inject(NotifyMessageService);

	public navigationEnd$ = injectNavigationEnd();

	constructor() {
		this.navigationEnd$
			.pipe(
				takeUntilDestroyed(this.#DestroyRef),
				tap(() => this.notifyMessage.close())
			)
			.subscribe();
		this.siteInfo.load()
			.pipe(
				takeUntilDestroyed(this.#DestroyRef),
				tap(() => this.$isReady.set(true)),
				take(1)
			)
			.subscribe();
	}

	action_reload(): void {
		this.$isView.set(false);
		this.notifyMessage.close();
		setTimeout(() => this.$isView.set(true));
	}

	action_logout(): void {
		this.auth.logout()
			.pipe(takeUntilDestroyed(this.#DestroyRef))
			.pipe(take(1))
			.subscribe();
	}
}
