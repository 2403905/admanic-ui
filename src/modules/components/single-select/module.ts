import {ModuleWithProviders, NgModule} from '@angular/core';
import {SingleSelectOptions} from './options.service';
import {HttpModule} from "@angular/http";
import { SingleSelectComponent } from './single-select.component';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ValidatorsModule } from '../validator/module';
import { SharedModule } from '../../shared/shared.module';
import { RouterModule } from '@angular/router';
import { ToastModule } from '../toastr/module';

@NgModule({
    imports: [
        HttpModule,
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        ValidatorsModule,
        SharedModule,
        ToastModule
    ],
    exports: [SingleSelectComponent, RouterModule],
    declarations: [SingleSelectComponent]
})
export class SingleSelectModule {
    public static forRoot(): ModuleWithProviders {
        return {
            ngModule: SingleSelectModule,
            providers: [SingleSelectOptions]
        };
    }
}
