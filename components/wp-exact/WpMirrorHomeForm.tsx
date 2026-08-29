/** Visual-only homepage form matching FluentForm / WP #contact-form chrome. */
export function WpMirrorHomeForm() {
  return (
    <div className="dgs-v1215-form-shortcode">
      <div className="fluentform ff-default fluentform_wrapper_1 ffs_default_wrap">
        <form
          id="fluentform_1"
          className="frm-fluent-form fluent_form_1 ff-el-form-top ff_form_instance_1_8 ffs_default"
          data-form_id="1"
          method="POST"
          data-submission="disabled"
        >
          <fieldset>
            <div className="ff-field_container ff-name-field-wrapper" data-type="name-element" data-name="names">
              <div className="ff-t-container">
                <div className="ff-t-cell">
                  <div className="ff-el-group ff-el-form-top">
                    <div className="ff-el-input--label ff-el-is-required asterisk-right">
                      <label htmlFor="ff_home_names_first_name">Full Name</label>
                    </div>
                    <div className="ff-el-input--content">
                      <input
                        type="text"
                        name="names[first_name]"
                        id="ff_home_names_first_name"
                        className="ff-el-form-control"
                        placeholder="Enter Your First Name"
                        aria-required
                        readOnly
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="ff-el-group">
              <div className="ff-el-input--label ff-el-is-required asterisk-right">
                <label htmlFor="ff_home_email">Email</label>
              </div>
              <div className="ff-el-input--content">
                <input
                  type="email"
                  name="email"
                  id="ff_home_email"
                  className="ff-el-form-control"
                  placeholder="Email Address"
                  aria-required
                  readOnly
                />
              </div>
            </div>

            <div className="ff-el-group">
              <div className="ff-el-input--label ff-el-is-required asterisk-right">
                <label htmlFor="ff_home_phone">Phone/Mobile</label>
              </div>
              <div className="ff-el-input--content">
                <input
                  type="tel"
                  name="phone"
                  id="ff_home_phone"
                  className="ff-el-form-control ff-el-phone"
                  placeholder="Mobile Number"
                  aria-required
                  readOnly
                />
              </div>
            </div>

            <div className="ff-el-group">
              <div className="ff-el-input--label ff-el-is-required asterisk-right">
                <label htmlFor="ff_home_company">Company Name</label>
              </div>
              <div className="ff-el-input--content">
                <input
                  type="text"
                  name="input_text"
                  id="ff_home_company"
                  className="ff-el-form-control"
                  aria-required
                  readOnly
                />
              </div>
            </div>

            <div className="ff-el-group">
              <div className="ff-el-input--label ff-el-is-required asterisk-right">
                <label htmlFor="ff_home_hear">How did you hear about us ?</label>
              </div>
              <div className="ff-el-input--content">
                <select name="dropdown_1" id="ff_home_hear" className="ff-el-form-control" defaultValue="" aria-required>
                  <option value="">- Select -</option>
                  <option value="Google Ads">Google Ads</option>
                  <option value="Google Search">Google Search</option>
                  <option value="Friend / Colleague">Friend / Colleague</option>
                  <option value="Twitter">Twitter</option>
                  <option value="Youtube">Youtube</option>
                  <option value="Instagram">Instagram</option>
                  <option value="Facebook">Facebook</option>
                  <option value="LinkedIn">LinkedIn</option>
                  <option value="Podcast">Podcast</option>
                  <option value="Blog / Article">Blog / Article</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>

            <div className="ff-el-group">
              <div className="ff-el-input--label ff-el-is-required asterisk-right">
                <label htmlFor="ff_home_subject">Subject</label>
              </div>
              <div className="ff-el-input--content">
                <input
                  type="text"
                  name="subject"
                  id="ff_home_subject"
                  className="ff-el-form-control"
                  aria-required
                  readOnly
                />
              </div>
            </div>

            <div className="ff-el-group">
              <div className="ff-el-input--label ff-el-is-required asterisk-right">
                <label htmlFor="ff_home_service">Service</label>
              </div>
              <div className="ff-el-input--content">
                <select name="dropdown" id="ff_home_service" className="ff-el-form-control" defaultValue="" aria-required>
                  <option value="">Service</option>
                  <option value="SEO">SEO</option>
                  <option value="AEO">AEO</option>
                  <option value="GEO">GEO</option>
                  <option value="AI Video Production">AI Video Production</option>
                  <option value="Website Development">Website Development</option>
                </select>
              </div>
            </div>

            <div className="ff-el-group">
              <div className="ff-el-input--label ff-el-is-required asterisk-right">
                <label htmlFor="ff_home_message">Your Message</label>
              </div>
              <div className="ff-el-input--content">
                <textarea
                  name="message"
                  id="ff_home_message"
                  className="ff-el-form-control"
                  rows={5}
                  aria-required
                  readOnly
                />
              </div>
            </div>

            <div className="ff-el-group ff-text-left ff_submit_btn_wrapper">
              <button type="button" className="ff-btn ff-btn-submit ff-btn-md ff_btn_style" disabled aria-disabled="true">
                Submit Form
              </button>
            </div>
          </fieldset>
        </form>
      </div>
    </div>
  );
}
