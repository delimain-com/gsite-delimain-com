import {Component, DestroyRef, inject} from '@angular/core';
import {NavigationService} from "../../../service/navigation/navigation.service";
import {UtilService} from "../../../service/util/util.service";
import {takeUntilDestroyed} from "@angular/core/rxjs-interop";
import {take} from "rxjs";

@Component({
	selector: 'app-event-add',
	imports: [],
	templateUrl: './event-add.component.html',
	styleUrl: './event-add.component.scss',
})
export default class EventAddComponent {
	#DestroyRef: DestroyRef = inject(DestroyRef);

	private navigation: NavigationService = inject(NavigationService);
	private util: UtilService = inject(UtilService);
	constructor() {
		this.navigation.navigateWithContext('eventEdit')
			.pipe(
				takeUntilDestroyed(this.#DestroyRef),
				take(1)
			)
			.subscribe();
	}
}
