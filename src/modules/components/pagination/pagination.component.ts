import {
    ChangeDetectionStrategy, Component, EventEmitter, Input, OnInit, Output,
    ViewEncapsulation
} from '@angular/core';

@Component({
    selector: 'adm-pagination',
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    host: {
        'class': 'adm-pagination',
        'aria-label': 'Page navigation'
    },
    styleUrls: ['./style.scss'],
    template: `
        <ng-template [ngIf]="_totalBtns && _totalBtns > 1">
            <table *ngIf="_totalBtns< 500;else paginationForAlotEls" class="adm-pagination__layout">
                <tr>
                    <ng-template [ngIf]="!showFullPagination && showDropdown">
                        <td>
                            Go to page:
                        </td>
                        <td>
                            <adm-single-select [options]="_range" (selected)="setCurrent($event.value)"
                                        [ngModel]="_current"
                                        class="adm-pagination__dropdown"
                                        placeholder="Page">
                            </adm-single-select>
                        </td>
                        <!--<td style="padding-right:15px;">-->
                        <!--of {{this._totalBtns}}-->
                        <!--</td>-->
                    </ng-template>
                    <td>
                        <ul class="adm-pagination__list">
                            <ng-template [ngIf]="showPrevDots && !showFullPagination">
                                <li>
                                    <button (click)="setCurrent(1)" [disabled]="_current == 1">{{titles.first}}
                                    </button>
                                </li>
                                <li>...</li>
                            </ng-template>
                            <ng-template ngFor let-num [ngForOf]="_range" let-i="index" [ngForTrackBy]="trackByFn">
                                <li *ngIf="isShowNum(num.value) || showFullPagination">
                                    <button [class.is__active]="num.value == _current"
                                            (click)="setCurrent(num.value)">
                                        {{num.label}}
                                    </button>
                                </li>
                            </ng-template>
                            <ng-template [ngIf]="showNextDots && !showFullPagination">
                                <li>...</li>
                                <li>
                                    <button (click)="setCurrent(_totalBtns)" [disabled]="_current == _totalBtns">
                                        {{titles.last}}
                                    </button>
                                </li>
                            </ng-template>
                        </ul>
                    </td>
                </tr>
            </table>
        </ng-template>
        <ng-template #paginationForAlotEls>
            <table class="adm-pagination__layout simple">
                <tr>
                    <td>
                        Page:
                    </td>
                    <td>
                        <ul class="adm-pagination__list" *ngIf="_current > 1">
                            <li>
                                <button (click)="setCurrent(_current + -1)" [disabled]="_current == _totalBtns">
                                    {{titles.prev}}
                                </button>
                            </li>
                        </ul>
                        <adm-input-container>
                            <input type="number" (keyup.enter)="setCurrent($event.target.value)" adm
                                   [ngModel]="_current" placeholder="Page">
                        </adm-input-container>
                        <ul class="adm-pagination__list" *ngIf="_current < _totalBtns">
                            <li>
                                <button (click)="setCurrent(_current + 1)" [disabled]="_current == _totalBtns">
                                    {{titles.next}}
                                </button>
                            </li>
                        </ul>
                    </td>
                    <td>
                        of {{this._totalBtns}}
                    </td>
                </tr>
            </table>
        </ng-template>
    `
})
export class PaginationComponent implements OnInit {
    _range: { label, value }[];
    _rangeLen: number = 0;
    _total: number;
    _current: number;
    _itemsPerPage: number;
    _totalBtns: number;

    @Input()
    set total(n: number) {
        if (!n) n = 1;
        if (n != this._total) {
            this._total = n;
            this.getRange();
        }
    }

    get total(): number {
        return this._total;
    }

    @Input()
    set itemsPerPage(n: number) {
        if (!n) n = 1;
        if (this._itemsPerPage != n) {
            this._itemsPerPage = n;
            this.getRange();
        }
    }

    get itemsPerPage(): number {
        return this._itemsPerPage;
    }

    @Input()
    set current(n: number) {
        if (!n) n = 1;
        if (n != this._current) {
            this._current = n;
            this.getRange();
        }
    }

    @Output() currentChange: EventEmitter<number> = new EventEmitter<number>();

    @Input() titles: { first, prev, prevSet, nextSet, next, last } = {
        first: 'First',
        prev: '\u00AB',
        prevSet: '...',
        nextSet: '...',
        next: '\u00BB',
        last: 'Last'
    };
    @Input() showDropdown: boolean = true;
    @Output() onPageChanged: EventEmitter<number> = new EventEmitter<number>();

    constructor() {
    }

    getRange() {
        this._totalBtns = Math.ceil(this.total / this.itemsPerPage);
        this._range = Array.from(Array(this._totalBtns ? this._totalBtns : 0).keys()).map(el => ({
            label: (el + 1).toString(),
            value: el + 1
        }));
        this._rangeLen = this._range.length;
    }

    isShowNum(n: number) {
        return (n == this._current) ||
            (n == (this._current + 1)) ||
            (n == (this._current + 2)) ||
            (n == (this._current - 1)) ||
            (n == (this._current - 2));
    }

    ngOnInit() {
        this.getRange();
    }

    trackByFn(item, index) {
        return index;
    }

    get showPrevDots(): boolean {
        return this._current > 3;
    }

    get showNextDots(): boolean {
        return this._current < this._totalBtns - 2;
    }

    get showFullPagination(): boolean {
        return this._totalBtns < 10;
    }

    setCurrent(n: number) {
        if (n < 1) {
            n = 1;
        } else if (n > this._totalBtns) {
            n = this._totalBtns;
        }
        this.current = n;
        this.currentChange.emit(this._current);
        this.onPageChanged.emit(this._current);
    }
}