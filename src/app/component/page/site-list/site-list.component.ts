import {Component, DestroyRef, effect, inject, signal, WritableSignal} from '@angular/core';
import {ApiService} from "../../../service/api/api.service";
import {RouterLink} from "@angular/router";
import {SiteInfoService} from "../../../service/site-info/site-info.service";
import {UtilService} from "../../../service/util/util.service";
import {takeUntilDestroyed} from "@angular/core/rxjs-interop";
import {Observable, take, tap} from "rxjs";

@Component({
	selector: 'app-site-list',
	imports: [
		RouterLink
	],
	templateUrl: './site-list.component.html',
	styleUrl: './site-list.component.scss',
})
export default class SiteListComponent {

	#DestroyRef: DestroyRef = inject(DestroyRef);

	public util: UtilService = inject(UtilService);

	private api: ApiService = inject(ApiService);

	public siteInfo: SiteInfoService = inject(SiteInfoService);

	public $isReady: WritableSignal<boolean> = signal(false);
	public $siteList: WritableSignal<any> = this.siteInfo.$siteList;
	public $langList: WritableSignal<any> = this.siteInfo.$langList;

	constructor() {
		this.$isReady.set(true);
	}

	load(): Observable<any> {
		return this.siteInfo.load();
	}

}
