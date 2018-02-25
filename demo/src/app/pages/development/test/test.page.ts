import { Component } from "@angular/core";
import { Http } from "@angular/http";
import 'rxjs/add/operator/toPromise';

@Component({
    selector: "demo-page-test",
    templateUrl: "./test.page.html"
})
export class TestPage {
    constructor(private http: Http) { }

    public defaultValues = [{first_name: 'default'}];

    optionsSearch = (query) =>{

        return this.http
            .get("https://reqres.in/api/users")
            .toPromise()
            .then((response) => {
                console.log(response);
                let res = response.json();
                return res.data;
            });
    }

    onTagSelected = (tag) => {
        console.log("selected " + tag.first_name);
    }

    onTagDeselected = (tag) => {
        console.log("deselected " + tag.first_name);
    }
}
