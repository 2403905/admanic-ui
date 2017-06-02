import { NgModule } from '@angular/core';
import { SingleSelectComponent } from './component';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ValidatorsModule } from '../validator/module';
import { SharedModule } from '../../shared/shared.module';
import { RouterModule } from '@angular/router';

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        ValidatorsModule,
        SharedModule
    ],
    exports: [SingleSelectComponent, RouterModule],
    declarations: [SingleSelectComponent],
    providers: []
})
export class SingleSelectModule {
}
