import {Component, DestroyRef, inject} from '@angular/core';
import {NavigationService} from "../../../service/navigation/navigation.service";
import {UtilService} from "../../../service/util/util.service";
import {takeUntilDestroyed} from "@angular/core/rxjs-interop";
import {switchMap, take, tap} from "rxjs";

@Component({
	selector: 'app-info-add',
	imports: [],
	templateUrl: './info-add.component.html',
	styleUrl: './info-add.component.scss',
})
export default class InfoAddComponent {

	#DestroyRef: DestroyRef = inject(DestroyRef);

	private navigation: NavigationService = inject(NavigationService);
	private util: UtilService = inject(UtilService);

	constructor() {
		this.navigation.navigateWithContext('infoEdit')
			.pipe(
				takeUntilDestroyed(this.#DestroyRef),
				take(1)
			)
			.subscribe();
	}

}
