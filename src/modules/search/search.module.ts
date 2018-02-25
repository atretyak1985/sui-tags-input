import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { SuiDropdownModule } from "../dropdown/index";
import { SuiLocalizationModule } from "../../behaviors/localization/index";
import { SuiUtilityModule } from "../../misc/util/index";
import { SuiSearch } from "./components/search";
import { SuiSearchResult } from "./components/search-result";
import { SuiSelectModule } from "../select/select.module";

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        SuiDropdownModule,
        SuiLocalizationModule,
        SuiUtilityModule,
        SuiSelectModule
    ],
    declarations: [
        SuiSearch,
        SuiSearchResult
    ],
    exports: [
        SuiSearch,
        SuiSearchResult
    ]
})
export class SuiSearchModule {}
