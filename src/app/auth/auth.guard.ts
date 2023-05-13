import { Injectable } from '@angular/core';
import {
  ActivatedRouteSnapshot,
  CanActivate,
  CanLoad,
  CanMatchFn,
  RouterStateSnapshot,
  UrlTree,
} from '@angular/router';
import { Observable, of, switchMap, take, tap } from 'rxjs';
import { AuthService } from './auth.service';
import { Router } from '@angular/router';
import { Route } from '@angular/router';
import { UrlSegment } from '@angular/router';

@Injectable({
  providedIn: 'root',
})
export class AuthGuard implements CanLoad {
  constructor(private authService: AuthService, private router: Router) {}

  canLoad(
    route: Route,
    segments: UrlSegment[]
  ):
    | Observable<boolean | UrlTree>
    | Promise<boolean | UrlTree>
    | boolean
    | UrlTree {
    return this.authService.userIsAuthenticated.pipe(
      take(1),
      switchMap((isAuthenticated) => {
        if (!isAuthenticated) {
          return this.authService.autoLogin();
        } else {
          return of(isAuthenticated);
        }
      }),
      tap((isAuthenticated) => {
        if (!isAuthenticated) {
          this.router.navigateByUrl('/auth');
        }
      })
    );
  }
}
