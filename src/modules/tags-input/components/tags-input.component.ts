import {
    Component, ViewChild, HostBinding, Input, AfterViewInit, HostListener,
    EventEmitter, Output, ElementRef, TemplateRef, Renderer2, OnDestroy
} from "@angular/core";
import {Util, ITemplateRefContext, IFocusEvent} from "../../../misc/util/index";
import {DropdownService} from "../../dropdown/services/dropdown.service";
import {SuiDropdownMenu} from "../../dropdown/directives/dropdown-menu";
import {ISearchLocaleValues} from "../../../behaviors/localization/interfaces/search-values";
import {RecursivePartial} from "../../../behaviors/localization/interfaces/partial";
import {FilterFn, LookupFn} from "../../search/helpers/lookup-fn";
import {SuiLocalizationService} from "../../../behaviors/localization/services/localization.service";
import {TagsInputService} from "../services/tags-input.service";

export interface ITagsInputResultContext<T> extends ITemplateRefContext<T> {
    query: string;
}

@Component({
    selector: "sui-tags-input",
    template: `
        <div class="ui input tags-div" [class.icon]="hasIcon" (click)="onClick($event)">
            <sui-multi-select-label class="tag-label"
                                    *ngFor="let selected of selectedOptions;"
                                    [value]="selected"
                                    [formatter]="configuredFormatter"
                                    (deselected)="deselectOption($event)"></sui-multi-select-label>
            <input class="tags-input"
                   type="text"
                   [attr.placeholder]="placeholder"
                   autocomplete="off"
                   [(ngModel)]="query"
                   (paste)="onPaste($event)"
            >
            <i *ngIf="hasIcon" class="search icon"></i>
        </div>
        <div class="results"
             suiDropdownMenu
             [menuTransition]="transition"
             [menuTransitionDuration]="transitionDuration"
             menuSelectedItemClass="active">

            <sui-search-result *ngFor="let r of results"
                               class="item"
                               [value]="r"
                               [query]="query"
                               [formatter]="resultFormatter"
                               [template]="resultTemplate"
                               (click)="select(r)"></sui-search-result>

            <div *ngIf="results.length == 0" class="message empty">
                <div class="header">{{ localeValues.noResults.header }}</div>
                <div class="description">{{ localeValues.noResults.message }}</div>
            </div>
        </div>
    `,
    styleUrls: ["../styles/tags-input.component.scss"]
})
export class TagsInput<T> implements AfterViewInit, OnDestroy {
    @Input()
    public selectedOptions: T[];
    public dropdownService: DropdownService;
    public searchService: TagsInputService<T, T>;

    @ViewChild(SuiDropdownMenu)
    private _menu: SuiDropdownMenu;

    // Sets the Semantic UI classes on the host element.
    // Doing it on the host enables use in menus etc.
    @HostBinding("class.ui")
    @HostBinding("class.search")
    private _searchClasses: boolean;

    @HostBinding("class.active")
    public get isActive(): boolean {
        return this.dropdownService.isOpen;
    }

    // Sets whether the search element has a visible search icon.
    @Input()
    public hasIcon: boolean;

    private _placeholder: string;

    private _delimiter: string;

    @Input()
    public minSearchLength: number;

    @Input()
    public maxTagsCount: number;

    @Input("tagSelected")
    public tagSelectedCb: Function;

    @Input("tagDeselected")
    public tagDeselectedCb: Function;

    // Gets & sets the placeholder text displayed inside the text input.
    @Input()
    public get placeholder(): string {
        return this._placeholder || this.localeValues.placeholder;
    }

    public set placeholder(placeholder: string) {
        this._placeholder = placeholder;
    }

    private _localeValues: ISearchLocaleValues;

    public localeOverrides: RecursivePartial<ISearchLocaleValues>;

    public get localeValues(): ISearchLocaleValues {
        return this._localizationService.override<"search">(this._localeValues, this.localeOverrides);
    }

    public get query(): string {
        return this.searchService.query;
    }

    public set query(query: string) {
        let lastDelimiterIndex = query.lastIndexOf(this._delimiter);

        if (query.indexOf(this._delimiter) !== -1) {
            this.createTags(query);
        }

        this.selectedResult = undefined;
        this.searchService.query = query.slice(lastDelimiterIndex + 1);
        this.open();
    }

    @Input()
    public set options(options: T[] | undefined) {
        if (options) {
            this.searchService.options = options;
        }
    }

    @Input()
    public set optionsFilter(filter: FilterFn<T> | undefined) {
        if (filter) {
            this.searchService.optionsFilter = filter;
        }
    }

    @Input()
    public set optionsLookup(lookupFn: LookupFn<T> | undefined) {
        this.searchService.optionsLookup = lookupFn;
    }

    @Input()
    public set optionsField(field: string | undefined) {
        this.searchService.optionsField = field;
    }

    public get optionsField(): string | undefined {
        return this.searchService.optionsField;
    }

    private _resultFormatter?: (r: T, q: string) => string;

    public get resultFormatter(): (result: T, query: string) => string {
        if (this._resultFormatter) {
            return this._resultFormatter;
        } else if (this.searchService.optionsLookup) {
            return r => this.readValue(r);
        } else {
            return (r, q) => this.searchService.highlightMatches(this.readValue(r), q);
        }
    }

    public get configuredFormatter(): (option: T) => string {
        if (this.searchService.optionsLookup) {
            return o => this.labelGetter(o);
        } else {
            return o => this.searchService.highlightMatches(this.labelGetter(o), this.query || "");
        }
    }

    public get labelGetter(): (obj: T) => string {
        // Helper function to retrieve the label from an item.
        return (obj: T) => {
            const label = Util.Object.readValue<T, string>(obj, this.optionsField);
            if (label != undefined) {
                return label.toString();
            }
            return "";
        };
    }

    private createTags(query: string) {
        let field = this.optionsField || '';
        let tags = query.split(this._delimiter);

        tags.splice(-1, 1);
        tags.forEach((tag) => {
            if (tag.length > 0) {
                let tagObject: any = {};
                tagObject[field] = tag;
                if (this.selectedOptions.length < this.maxTagsCount) {
                    this.selectedOptions.push(tagObject)
                }
            }
        })
    }

    @Input()
    public set resultFormatter(formatter: (result: T, query: string) => string) {
        this._resultFormatter = formatter;
    }

    @Input()
    public resultTemplate: TemplateRef<ITagsInputResultContext<T>>;

    @Input()
    public retainSelectedResult: boolean;

    @Input()
    public set searchDelay(delay: number) {
        this.searchService.searchDelay = delay;
    }

    @HostBinding("class.loading")
    public get isSearching(): boolean {
        return this.searchService.isSearching;
    }

    @Input()
    public maxResults: number;

    public get results(): T[] {
        return this.searchService.results
            .filter((o: any) => o[this.optionsField ? this.optionsField : ''].slice(0, this.query.length).toLowerCase() === this.query.toLowerCase())
            .slice(0, this.maxResults);
    }

    // Stores the currently selected result.
    public selectedResult?: T;

    // Emits whenever a new result is selected.
    @Output("resultSelected")
    public onResultSelected: EventEmitter<T>;

    @Input()
    public transition: string;

    @Input()
    public transitionDuration: number;

    private _documentClickListener: () => void;

    constructor(private _element: ElementRef, renderer: Renderer2, private _localizationService: SuiLocalizationService) {
        this.dropdownService = new DropdownService();
        this.searchService = new TagsInputService<T, T>();

        this.selectedOptions = [];
        this._delimiter = ',';

        this.onLocaleUpdate();
        this._localizationService.onLanguageUpdate.subscribe(() => this.onLocaleUpdate());

        this._searchClasses = true;
        this.hasIcon = true;
        this.retainSelectedResult = true;
        this.searchDelay = 200;
        this.maxResults = 7;
        this.minSearchLength = 1;
        this.maxTagsCount = 10;

        this.onResultSelected = new EventEmitter<T>();

        this.transition = "scale";
        this.transitionDuration = 200;

        this._documentClickListener = renderer.listen("document", "click", (e: MouseEvent) => this.onDocumentClick(e));
    }

    public ngAfterViewInit(): void {
        this._menu.service = this.dropdownService;
        this.searchService.getData();
    }

    private onLocaleUpdate(): void {
        this._localeValues = this._localizationService.get().search;
    }

    public select(result: T): void {
        if (this.selectedOptions.length < this.maxTagsCount) {
            let selectedIndex = this.searchService.results.indexOf(result);
            this.searchService.results.splice(selectedIndex, 1);
            this.onResultSelected.emit(result);
            this.selectedOptions.push(result);
            if (this.tagSelectedCb) {
                this.tagSelectedCb.call(undefined, result);
            }
        }
        this.query = '';
    }

    public deselectOption(option: T): void {
        // Update selected options to the previously selected options \ {option}.
        this.selectedOptions = this.selectedOptions.filter(so => so !== option);
        this.searchService.results.push(option);
        if (this.tagDeselectedCb) {
            this.tagDeselectedCb.call(undefined, option);
        }
    }

    public onClick(e: MouseEvent): void {
        this.open();
    }

    @HostListener("focusin")
    private onFocusIn(): void {
        if (!this.dropdownService.isAnimating) {
            this.open();
        }
    }

    public onPaste(e: any) {
        e.preventDefault();

        let content = e.clipboardData.getData('text/plain');
        this.createTags(content);
    }

    private open(): void {
        if (this.searchService.query.length >= this.minSearchLength) {
            // Only open on click when there is a query entered.
            this.dropdownService.setOpenState(true);
        }
    }

    @HostListener("focusout", ["$event"])
    private onFocusOut(e: IFocusEvent): void {
        if (!this._element.nativeElement.contains(e.relatedTarget)) {
            this.dropdownService.setOpenState(false);
        }
    }

    public onDocumentClick(e: MouseEvent): void {
        if (!this._element.nativeElement.contains(e.target)) {
            this.dropdownService.setOpenState(false);
        }
    }

    // Reads the specified field from an item.
    public readValue(object: T): string {
        return Util.Object.readValue<T, string>(object, this.searchService.optionsField);
    }

    public ngOnDestroy(): void {
        this._documentClickListener();
    }
}
