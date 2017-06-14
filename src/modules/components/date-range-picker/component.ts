import {
    ChangeDetectionStrategy, Component, EventEmitter, forwardRef, HostListener, Input, Output,
    ViewEncapsulation
} from '@angular/core';
import { DateRangePickerComponent } from './component.selector';
import { NG_VALUE_ACCESSOR } from '@angular/forms';
import * as moment from 'moment';
import { IDate, IDateRange } from './models';
import { Calendar } from './service.calendar';


@Component({
    entryComponents: [
        DateRangePickerComponent
    ],
    selector: 'adm-date-range-picker',
    styleUrls: ['./style.scss'],
    host: {
        'class': 'adm-date-picker'
    },
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    providers: [
        {
            provide: NG_VALUE_ACCESSOR,
            useExisting: forwardRef(() => AdmDateRangePickerContainer),
            multi: true
        }
    ],
    template: `
        <button (click)="toggle();">{{label}}</button>
        <div class="adm-date-picker__holder" *ngIf="isOpen">
            <date-range-picker-selector (apply)="onApply($event);"
                                        [initialDate]="value"
                                        [ranges]="rangesList"
                                        [format]="format"></date-range-picker-selector>
        </div>
    `
})
export class AdmDateRangePickerContainer {
    @Output() change: EventEmitter<IDate> = new EventEmitter();
    @Input() format = 'DD/MM/YYYY';

    private _open: boolean = true;
    private _value: IDate = {start: null, end: null};

    get value(): IDate {
        return this._value;
    }

    rangesList: IDateRange[] = [
        {
            label: 'Today',
            start: this._calendar.today,
            end: this._calendar.today
        },
        {
            label: 'Yesterday',
            start: moment().add(-1, 'days').toDate(),
            end: moment().add(-1, 'days').toDate()
        },
        {
            label: 'This month',
            start: moment().startOf('month').toDate(),
            end: moment().endOf('month').toDate()
        },
        {
            label: 'Last month',
            start: moment().subtract(1, 'month').startOf('month').toDate(),
            end: moment().subtract(1, 'month').endOf('month').toDate()
        },
        {
            label: 'Random',
            start: moment().subtract(3, 'month').toDate(),
            end: moment().startOf('month').toDate()
        }
    ];


    constructor(private _calendar: Calendar) {
    }

    toggle() {
        this._open = !this._open;
    }

    show() {
        this._open = true;
    }

    hide() {
        this._open = false;
    }

    get isOpen(): boolean {
        return this._open;
    }

    onApply(data: IDate) {
        this._open = false;
        this.writeValue(data);
    }

    get label(): string {
        if (this._calendar.isModelValid(this.value)) {
            const selectedRange = this.rangesList.filter((range: IDateRange) => {
                return range.start.toISOString() === this.value.start.toISOString() && range.end.toISOString() === this.value.end.toISOString();
            })[0];

            if (selectedRange) {
                return selectedRange.label;
            }

            if (this.value.start.toISOString() === this.value.end.toISOString()) {
                return `${moment(this.value.start).format(this.format)}`;
            }

            return `${moment(this.value.start).format(this.format)} - ${moment(this.value.end).format(this.format)}`;
        }
        return 'Select Date';
    }

    @HostListener('click', ['$event']) onClick(e: Event) {
        e.stopPropagation();
    }

    @HostListener('document: click', ['$event']) onDocumentClick() {
        this.hide();
    }

    //sad


    writeValue(value: IDate) {
        this._value = value;
        this.onChange(this.value);
        this.onTouched();
        this.change.emit(this.value);
    }

    onChange: Function = (_: any) => {
    };
    onTouched: Function = () => {
    };

    registerOnChange(fn: Function): void {
        this.onChange = fn;
    }

    registerOnTouched(fn: Function): void {
        this.onTouched = fn;
    }
}
