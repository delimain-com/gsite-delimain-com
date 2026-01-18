import {inject, Injectable} from '@angular/core';
import {linkedQueryParam} from "ngxtension/linked-query-param";
import {UtilService} from "../util/util.service";
import {from, Observable, switchMap, take} from 'rxjs';
import {Router} from "@angular/router";

@Injectable({
	providedIn: 'root',
})
export class NavigationService {

	private util: UtilService = inject(UtilService);
	public $domain = linkedQueryParam("domain");
	private router: Router = inject(Router);

	navigateWithContext(path: string): Observable<any> {
		return this.util.uid()
			.pipe(
				switchMap((uid: string) => {
					const extras = {
						queryParams: {uid, domain: this.$domain()},
						replaceUrl: true
					};
					return from(this.router.navigate([path], extras));
				}),
				take(1)
			);
	}
}
