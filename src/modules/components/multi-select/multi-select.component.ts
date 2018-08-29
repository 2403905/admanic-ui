import {
    AfterViewInit, Component, ElementRef, EventEmitter, Input, Output,
    ViewEncapsulation, forwardRef, OnDestroy
} from '@angular/core';
import { NG_VALUE_ACCESSOR } from '@angular/forms';
import { MultiselectParams } from './model';
import * as $ from 'jquery';

const MULTISELECT_VALUE_ACCESSOR: any = {
    provide: NG_VALUE_ACCESSOR,
    useExisting: forwardRef(() => MultiSelectComponent),
    multi: true
};

@Component({
    selector: 'adm-multi-select, adm-select[multi]',
    encapsulation: ViewEncapsulation.None,
    host: {
        '[class.adm-multi-select]': 'true',
        '[class.is-hide-selected]': '_isHideSelected',
        '[class.is-show-count]': '_isShowSelectedCount',
        '[class.with-add-new-btn]': '_showAddNewBtn',
        '[class.is-open]': '_isOpen && !_isTags',
        '[class.is-tags]': '_isTags',
        '[class.is-above]': '_isAbove',
        '[class.pending-data-load]': '!_dataLoaded'
    },
    styleUrls: ['styles.scss'],
    providers: [MULTISELECT_VALUE_ACCESSOR],
    template: `
        <div class="adm-spinner-container"
             style="transform: none; z-index: 1; right: 5px; left:initial; top: 0; bottom:0; margin: auto;"
             *ngIf="!_dataLoaded">
            <div class="spinner spinner-1"></div>
            <div class="spinner spinner-2"></div>
            <div class="spinner spinner-3"></div>
            <div class="spinner spinner-4"></div>
            <div class="spinner spinner-5"></div>
            <div class="spinner spinner-6"></div>
            <div class="spinner spinner-7"></div>
            <div class="spinner spinner-8"></div>
            <div class="spinner spinner-9"></div>
            <div class="spinner spinner-10"></div>
            <div class="spinner spinner-11"></div>
            <div class="spinner spinner-12"></div>
        </div>
        <select></select>
        <div class="adm-multi-select__dropdown">
            <div class="adm-multi-select__dropdown-wrap"></div>
            <button *ngIf="_showAddNewBtn" (mousedown)="onAddNewBtnClick($event)" class="adm-multi-select__add-new-btn"
                    type="button">
                <i class="material-icons">add</i> Add new
            </button>
        </div>
    `
})
export class MultiSelectComponent implements AfterViewInit, OnDestroy {
    _selectEl: any;
    _defaultParams: MultiselectParams = {width: '100%'};
    _params: MultiselectParams = this._defaultParams;
    _value: string[] = [];
    _isShowSelectedCount: boolean;
    _isHideSelected: boolean;
    _showAddNewBtn: boolean;
    _isOpen: boolean;
    _modelChangedI = 0;
    _hasGroups: boolean;
    _isTags: boolean;
    _isAbove: boolean;
    _notSelect2Instance: boolean;
    _dataLoaded: boolean;

    @Output() change = new EventEmitter();
    @Output() open = new EventEmitter();
    @Output() opening = new EventEmitter();
    @Output() close = new EventEmitter();
    @Output() closing = new EventEmitter();
    @Output() select = new EventEmitter();
    @Output() selecting = new EventEmitter();
    @Output() unselect = new EventEmitter();
    @Output() unselecting = new EventEmitter();
    @Output() onAddClick = new EventEmitter();

    @Input()
    set params(params: MultiselectParams) {
        // todo: refactor _selectEl
        if (this._selectEl && this._selectEl.hasClass('select2-hidden-accessible')) {
            window['$'](this._selectEl[0]).select2('destroy');
            // window['$'](this._selectEl[0]).sortable('destroy');
            this._selectEl[0].innerHTML = '';
        }

        let data = [];
        if (params.data) {
            if (this._hasGroups) {
                data = params.data.map((opt: any) => ({
                    text: opt.name,
                    children: opt.values.map((el: any) => ({
                        id: el.value || el.id,
                        text: el.label || el.text
                    }))
                }));
            } else {
                data = params.data.map(opt => ({
                    id: opt.value || opt.id,
                    text: opt.label || opt.text
                }));
            }
        }

        this._params = {
            ...this._defaultParams,
            ...this._params,
            ...params,
            data,
            allowClear: true
        };
        setTimeout(() => {
            this._showAddNewBtn = this._params.showAddNewBtn;
            this._isTags = this._params.tags;
            this._isHideSelected = this._params.hideSelected;
        }, 1);

        if (this._selectEl && !!window['$']().select2) {
            const $selectEl = window['$'](this._selectEl[0]);
            $selectEl.select2(this._params);
            const $sortableContainer = $selectEl.parent().find('.select2-selection__rendered');
            $sortableContainer.sortable({
                containment: 'parent',
                appendTo: 'body',
                items: '.select2-selection__choice',
                update: () => {
                    const $arr = $sortableContainer.find('.select2-selection__choice');
                    const d = $selectEl.select2('data');
                    const newVal = Array.from($arr.map((i, el) => d.find(item => item.text === $(el).attr('title')).id));
                    this.writeValue(newVal, true);
                }
            });

        }
    };

    @Input()
    set options(defaults: { value: string, label: string }[]) {
        setTimeout(() => {
            if (defaults && Array.isArray(defaults)) {
                this._hasGroups = defaults.every((el: any) => el.hasOwnProperty('name'));
                this.params = {...this._params, data: defaults};
                this._dataLoaded = true;
            } else if (defaults === null) {
                this._hasGroups = false;
                this._dataLoaded = false;
                this.params = {...this._params, data: []};
            }
        }, 1);
    };

    get value() {
        return this._value;
    }

    set value(val) {
        this._value = val;
        if (++this._modelChangedI > 2) {
            this.onChange(val);
            this.onTouched();
        }
    }

    constructor(private el: ElementRef) {
    }

    init() {
        this._selectEl = $(this.el.nativeElement.querySelector('select'));
        this._defaultParams = Object.assign({}, {
            multiple: true,
            dropdownParent: $(this.el.nativeElement).find('.adm-multi-select__dropdown-wrap'),
            placeholder: 'Select'
        }, this._params);
        this.params = this._defaultParams;
    }

    bindEvents() {
        window['$'](this._selectEl)
            .on('change', (event) => {
                this.writeValue($(event.currentTarget).val(), false).then(() => {
                    if (!!this._params.showSelectedCount) {
                        this.showSelectedCountFn(event);
                    }
                    this.change.emit(event);
                });
            })
            .on('select2:open', (event) => {
                this.open.emit(event);
                this._isOpen = true;
                this._isAbove = $(event.target).next().hasClass('select2-container--above');
            })
            .on('select2:opening', (event) => {
                this.opening.emit(event);
            })
            .on('select2:close', (event) => {
                this.close.emit(event);
                this._isOpen = false;
            })
            .on('select2:closing', (event) => {
                this.closing.emit(event);
            })
            .on('select2:select', (event) => {
                if (this._params.orderByInput) {
                    let $element = $(event.params.data.element);
                    $element.detach();
                    $(event.currentTarget).append($element);
                    $(event.currentTarget).trigger('change');
                    this.writeValue($(event.currentTarget).val(), false);
                }
                setTimeout(() => {
                    this.select.emit([event, this.value, event.params.data]);
                }, 3);
            })
            .on('select2:selecting', (event) => {
                this.selecting.emit(event);
            })
            .on('select2:unselect', (event) => {
                this.unselect.emit([event, this.value]);
            })
            .on('select2:unselecting', (event) => {
                this.unselecting.emit(event);
            });
    }

    onAddNewBtnClick(e) {
        this.onAddClick.emit(e);
    }

    showSelectedCountFn(e: Event) {
        $(e.currentTarget).parent().find('.select2-search.select2-search--inline .select2-selection__choice').remove();
        if (this.value && this.value.length > this._params.showSelectedCount) {
            this._isShowSelectedCount = true;
            $(e.currentTarget)
                .parent()
                .find('.select2-search.select2-search--inline')
                .prepend(`<span class='select2-selection__choice'><span class='select2-selection__clear'>×</span> ${this.value.length} items selected </span>`);
        } else {
            this._isShowSelectedCount = false;
        }
    }

    writeValue(val: any, trigger = true): Promise<any> {
        return new Promise((resolve) => {
            setTimeout(() => {
                this.value = val;
                if (this.value !== undefined && this._selectEl !== undefined && trigger) {
                    this._selectEl.val(this.value).trigger('change');
                }
                resolve();
            }, 2);
        });
    }

    ngAfterViewInit() {
        this.init();
        this.bindEvents();
    }

    ngOnDestroy() {
        if (this._selectEl) {
            this._selectEl.select2('destroy');
        }
    }

    onChange: Function = (_: any) => {
    }
    onTouched: Function = () => {
    }

    registerOnChange(fn: Function): void {
        this.onChange = fn;
    }

    registerOnTouched(fn: Function): void {
        this.onTouched = fn;
    }
}