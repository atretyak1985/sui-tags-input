import { NgModule } from "@angular/core";

// Collections
import {
    SuiMessageModule,
    SuiPaginationModule
} from "./collections";

// Modules
import {
    SuiAccordionModule,
    SuiCheckboxModule,
    SuiCollapseModule,
    SuiDatepickerModule,
    SuiDimmerModule,
    SuiDropdownModule,
    SuiModalModule,
    SuiPopupModule,
    SuiProgressModule,
    SuiRatingModule,
    SuiSearchModule,
    SuiSidebarModule,
    SuiTabsModule,
    SuiSelectModule,
    TagsInputModule,
    SuiTransitionModule
} from "./modules";

// Behaviors
import {
    SuiLocalizationModule
} from "./behaviors";

// Misc
import {
    SuiUtilityModule
} from "./misc";

@NgModule({
    exports: [
        // Collections
        SuiMessageModule,
        SuiPaginationModule,

        // Modules
        SuiAccordionModule,
        SuiCheckboxModule,
        SuiCollapseModule,
        SuiDatepickerModule,
        SuiDimmerModule,
        SuiDropdownModule,
        SuiModalModule,
        SuiPopupModule,
        SuiProgressModule,
        SuiRatingModule,
        SuiSearchModule,
        SuiSelectModule,
        SuiSidebarModule,
        SuiTabsModule,
        TagsInputModule,
        SuiTransitionModule,

        // Behaviors
        SuiLocalizationModule,

        // Misc
        SuiUtilityModule
    ]
})
export class SuiModule {}
