import {Component, DestroyRef, inject, signal, WritableSignal} from '@angular/core';
import {UtilService} from "../../../service/util/util.service";
import {ApiService} from "../../../service/api/api.service";
import {Observable, take, tap} from "rxjs";
import {takeUntilDestroyed} from "@angular/core/rxjs-interop";

@Component({
	selector: 'app-cast-schedule-datetime-list',
	imports: [],
	templateUrl: './cast-schedule-datetime-list.component.html',
	styleUrl: './cast-schedule-datetime-list.component.scss',
})
export default class CastScheduleDatetimeListComponent {

	#DestroyRef: DestroyRef = inject(DestroyRef);

	public util: UtilService = inject(UtilService);
	private api: ApiService = inject(ApiService);

	constructor() {
		this.load()
			.pipe(
				takeUntilDestroyed(this.#DestroyRef),
				take(1)
			)
			.subscribe();
	}

	$load_isWait: WritableSignal<boolean> = signal(false);

	load(): Observable<any> {
		this.$load_isWait.set(true);
		const params: any = {
			query: {
				scheduleDate: Date.now(),
			}
		};
		return this.api.post('page/castScheduleList/load', params)
			.pipe(
				takeUntilDestroyed(this.#DestroyRef),
				tap(console.log),
				tap(({results}) => {
					console.log('results:', results);
					this.$load_isWait.set(false);
				}),
				take(1)
			);
	}

	action_load(): void {
		this.load()
			.pipe(
				takeUntilDestroyed(this.#DestroyRef),
				take(1)
			)
			.subscribe();
	}

}
