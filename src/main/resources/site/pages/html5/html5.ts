import {
	doctype, html, head, title, body, div, render
} from 'render-js/dist/html';
import {forceArray} from '@enonic/js-utils/array/forceArray';
import {toStr} from '@enonic/js-utils/value/toStr';
//import {dlv} from '/lib/util/object';
import {
	getContent as getCurrentContent,
	getSiteConfig as getCurrentSiteConfig
} from '/lib/xp/portal';


interface Attribute {
	property: string
	value?: string
}

type BodyStyleAttribute = Attribute[] | undefined;

interface Response {
	body: string
	contentType: string
	headers?: Record<string, string>
}


export function get(req: {
	mode: 'edit'|'live'|'preview'
}) {
	log.debug(toStr({req}));

	const siteConfig = getCurrentSiteConfig<{
		bodyStyleAttribute?: BodyStyleAttribute
		csp?: string
	}>(); log.debug(toStr({siteConfig}));
	const content = getCurrentContent(); log.debug(toStr({content}));
	const {displayName} = content;
	const pageConfig = content.page.config; log.debug(toStr({pageConfig}));

	const bodyStyleAttribute: BodyStyleAttribute = siteConfig.bodyStyleAttribute || pageConfig.bodyStyleAttribute as BodyStyleAttribute;
	log.debug(toStr({bodyStyleAttribute}));

	const {components} = content.page.regions.body; log.debug(toStr({components}));
	const response: Response = {
		body: render([
			doctype(),
			html([
				head(title(displayName)),
				body({
					style: bodyStyleAttribute
						? forceArray(bodyStyleAttribute)
							.map((h) => h.value ? `${h.property}:${h.value}` : h.property) // eslint-disable-line no-confusing-arrow
							.join(';')
						: null
				}, div(
					{
						dataPortalRegion: req.mode === 'edit' ? 'body' : null
					},
					(components && components.length)
						? components.map((c) => `<!--# COMPONENT ${c.path} -->`)
						: ''
				)) // body
			]) // html
		]), // render
		contentType: 'text/html; charset=utf-8'
	};
	if (siteConfig.csp) {
		response.headers = {
			'content-security-policy': siteConfig.csp
		};
	}
	return response;
}
