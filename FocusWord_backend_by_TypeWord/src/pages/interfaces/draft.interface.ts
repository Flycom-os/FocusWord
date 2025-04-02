import { SEOPreset } from 'src/seo/seo-presets/seo-presets.model';
import { TemplateModel } from 'src/templates/template.model';
import { User } from 'src/users/user.model';

export interface ProcessDataInterface {
  user: User;
  seoPreset: SEOPreset;
  template: TemplateModel;
  date_to_publish: Date;
}
