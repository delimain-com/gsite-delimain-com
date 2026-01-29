import {Component, DestroyRef, inject} from '@angular/core';
import {NavigationService} from "../../../service/navigation/navigation.service";
import {UtilService} from "../../../service/util/util.service";
import {takeUntilDestroyed} from "@angular/core/rxjs-interop";
import {take} from "rxjs";

@Component({
	selector: 'app-link-add',
	imports: [],
	templateUrl: './link-add.component.html',
	styleUrl: './link-add.component.scss',
})
export default class LinkAddComponent {
	#DestroyRef: DestroyRef = inject(DestroyRef);

	private navigation: NavigationService = inject(NavigationService);
	private util: UtilService = inject(UtilService);

	constructor() {
		this.navigation.navigateWithContext('linkEdit')
			.pipe(
				takeUntilDestroyed(this.#DestroyRef),
				take(1)
			)
			.subscribe();
	}
}
