import type { HomepageGalleryItem } from "@/lib/portfolio/types";

const PREVIEW_COUNT = 8;

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export function buildCreativeGalleryHtml(items: HomepageGalleryItem[]): string {
  const preview = items.slice(0, PREVIEW_COUNT);

  const tiles = preview
    .map((item) => {
      const label = escapeHtml(item.alt || item.title);
      const src = escapeHtml(item.thumbnail);
      return `<a href="/portfolio/" class="dgs-native-gallery__item" aria-label="${label}"><img src="${src}" alt="${label}" width="${item.width}" height="${item.height}" loading="lazy" decoding="async" class="dgs-native-gallery__image" /></a>`;
    })
    .join("");

  return `<div class="dgs-native-gallery">${tiles}<div class="dgs-native-gallery__cta-row"><a href="/portfolio/" class="dgs-v1215-btn dgs-v1215-btn-primary dgs-native-gallery__cta">View Portfolio<span>→</span></a></div></div>`;
}

export function buildHomeFormHtml(): string {
  return `<div class="dgs-v1215-form-shortcode"><div class="fluentform ff-default fluentform_wrapper_1 ffs_default_wrap"><form id="fluentform_1" class="frm-fluent-form fluent_form_1 ff-el-form-top ff_form_instance_1_8 ffs_default" data-form_id="1" method="POST" data-submission="disabled"><fieldset><div class="ff-field_container ff-name-field-wrapper" data-type="name-element" data-name="names"><div class="ff-t-container"><div class="ff-t-cell"><div class="ff-el-group ff-el-form-top"><div class="ff-el-input--label ff-el-is-required asterisk-right"><label for="ff_home_names_first_name">Full Name</label></div><div class="ff-el-input--content"><input type="text" name="names[first_name]" id="ff_home_names_first_name" class="ff-el-form-control" placeholder="Enter Your First Name" aria-required="true" readonly /></div></div></div></div></div><div class="ff-el-group"><div class="ff-el-input--label ff-el-is-required asterisk-right"><label for="ff_home_email">Email</label></div><div class="ff-el-input--content"><input type="email" name="email" id="ff_home_email" class="ff-el-form-control" placeholder="Email Address" aria-required="true" readonly /></div></div><div class="ff-el-group"><div class="ff-el-input--label ff-el-is-required asterisk-right"><label for="ff_home_phone">Phone/Mobile</label></div><div class="ff-el-input--content"><input type="tel" name="phone" id="ff_home_phone" class="ff-el-form-control ff-el-phone" placeholder="Mobile Number" aria-required="true" readonly /></div></div><div class="ff-el-group"><div class="ff-el-input--label ff-el-is-required asterisk-right"><label for="ff_home_company">Company Name</label></div><div class="ff-el-input--content"><input type="text" name="input_text" id="ff_home_company" class="ff-el-form-control" aria-required="true" readonly /></div></div><div class="ff-el-group"><div class="ff-el-input--label ff-el-is-required asterisk-right"><label for="ff_home_hear">How did you hear about us ?</label></div><div class="ff-el-input--content"><select name="dropdown_1" id="ff_home_hear" class="ff-el-form-control" aria-required="true"><option value="">- Select -</option><option value="Google Ads">Google Ads</option><option value="Google Search">Google Search</option><option value="Friend / Colleague">Friend / Colleague</option><option value="Twitter">Twitter</option><option value="Youtube">Youtube</option><option value="Instagram">Instagram</option><option value="Facebook">Facebook</option><option value="LinkedIn">LinkedIn</option><option value="Podcast">Podcast</option><option value="Blog / Article">Blog / Article</option><option value="Other">Other</option></select></div></div><div class="ff-el-group"><div class="ff-el-input--label ff-el-is-required asterisk-right"><label for="ff_home_subject">Subject</label></div><div class="ff-el-input--content"><input type="text" name="subject" id="ff_home_subject" class="ff-el-form-control" aria-required="true" readonly /></div></div><div class="ff-el-group"><div class="ff-el-input--label ff-el-is-required asterisk-right"><label for="ff_home_service">Service</label></div><div class="ff-el-input--content"><select name="dropdown" id="ff_home_service" class="ff-el-form-control" aria-required="true"><option value="">Service</option><option value="SEO">SEO</option><option value="AEO">AEO</option><option value="GEO">GEO</option><option value="AI Video Production">AI Video Production</option><option value="Website Development">Website Development</option></select></div></div><div class="ff-el-group"><div class="ff-el-input--label ff-el-is-required asterisk-right"><label for="ff_home_message">Your Message</label></div><div class="ff-el-input--content"><textarea name="message" id="ff_home_message" class="ff-el-form-control" rows="5" aria-required="true" readonly></textarea></div></div><div class="ff-el-group ff-text-left ff_submit_btn_wrapper"><button type="button" class="ff-btn ff-btn-submit ff-btn-md ff_btn_style" disabled aria-disabled="true">Submit Form</button></div></fieldset></form></div></div>`;
}
