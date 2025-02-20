import { Routes } from '@angular/router';
import { AppComponent } from './app.component';
import { AddImageComponent } from './component/add-image/add-image.component';
import { HomepageComponent } from './component/homepage/homepage.component';
import { TestComponent } from './component/test/test.component';

export const routes: Routes = [
    {
        path : "",
        component : AppComponent,
        children : [
            {
                path : "",
                component : HomepageComponent
            }
        ]
    },
    {
        path : "add-image",
        component : AddImageComponent
    },
    {
        path : "test",
        component : TestComponent
    },
    {
        path : "darshil",
        component : TestComponent
    },
    {
        path : "harsh",
        component : TestComponent
    },
    {
        path : "kenil",
        component : TestComponent
    }
];