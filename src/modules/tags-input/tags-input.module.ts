import {NgModule} from "@angular/core";
import {CommonModule} from "@angular/common";
import {FormsModule} from "@angular/forms";
import {TagsInput} from "./components/tags-input.component"
import {SuiSearchModule} from "../search/search.module";
import {SuiSelectModule} from "../select/select.module";
import {SuiUtilityModule} from "../../misc/util/util.module";
import {SuiLocalizationModule} from "../../behaviors/localization/localization.module";
import {SuiDropdownModule} from "../dropdown/dropdown.module";

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        SuiDropdownModule,
        SuiLocalizationModule,
        SuiUtilityModule,
        SuiSearchModule,
        SuiSelectModule
    ],
    declarations: [
        TagsInput
    ],
    exports: [
        TagsInput
    ]
})
export class TagsInputModule {}
