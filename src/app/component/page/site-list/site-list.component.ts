import {Component, DestroyRef, inject, signal, WritableSignal} from '@angular/core';
import {ApiService} from "../../../service/api/api.service";
import {RouterLink} from "@angular/router";
import {SiteInfoService} from "../../../service/site-info/site-info.service";
import {UtilService} from "../../../service/util/util.service";
import {Observable} from "rxjs";

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

	public siteInfo: SiteInfoService = inject(SiteInfoService);

	public $isReady: WritableSignal<boolean> = signal(false);
	public $siteList: WritableSignal<any> = this.siteInfo.$siteList;

	constructor() {
		this.$isReady.set(true);
	}

	load(): Observable<any> {
		return this.siteInfo.load();
	}

}
