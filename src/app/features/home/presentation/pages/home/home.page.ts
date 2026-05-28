import { ChangeDetectionStrategy, Component } from '@angular/core';
import { AboutSectionComponent } from '../../components/about-section/about-section';
import { ContactSectionComponent } from '../../components/contact-section/contact-section';
import { FooterSectionComponent } from '../../components/footer-section/footer-section';
import { HeroSectionComponent } from '../../components/hero-section/hero-section';

@Component({
    selector: 'app-home',
    imports: [HeroSectionComponent, AboutSectionComponent, ContactSectionComponent, FooterSectionComponent],
    changeDetection: ChangeDetectionStrategy.OnPush,
    styleUrl: './home.scss',
    templateUrl: './home.html',
})
export class HomePage {}
