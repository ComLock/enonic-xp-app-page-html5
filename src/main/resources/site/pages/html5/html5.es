import {
    doctype, html, head, body, div, render
} from 'render-js';
//import {toStr} from '/lib/enonic/util';
import {forceArray} from '/lib/enonic/util/data';
//import {dlv} from '/lib/enonic/util/object';
import {
    getContent as getCurrentContent,
    getSiteConfig as getCurrentSiteConfig
} from '/lib/xp/portal';


export function get(req) {
    //log.info(toStr({req});
    const siteConfig = getCurrentSiteConfig(); //log.info(toStr({siteConfig}));
    const content = getCurrentContent(); //log.info(toStr({content}));
    const pageConfig = content.page.config; //log.info(toStr({pageConfig}));
    const bodyStyleAttribute = siteConfig.bodyStyleAttribute || pageConfig.bodyStyleAttribute; //log.info(toStr({bodyStyleAttribute}));
    const {components} = content.page.regions.body; //log.info(toStr({components}));
    return {
        body: render([
            doctype(),
            html([
                head(),
                body({
                    style: bodyStyleAttribute
                        ? forceArray(bodyStyleAttribute)
                            .map(h => h.value ? `${h.property}:${h.value}` : h.property) // eslint-disable-line no-confusing-arrow
                            .join(';')
                        : null
                }, div(
                    {
                        dataPortalRegion: req.mode === 'edit' ? 'body' : null
                    },
                    (components && components.length)
                        ? components.map(c => `<!--# COMPONENT ${c.path} -->`)
                        : ''
                )) // body
            ]) // html
        ]), // render
        contentType: 'text/html; charset=utf-8'
    };
}
