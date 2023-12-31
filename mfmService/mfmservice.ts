import { intersperse } from './misc/array.js';
import type { IMentionedRemoteUsers } from '@/models/entities/Note.js';
import type * as mfm from 'mfm-js';

export function toHtml(nodes: mfm.MfmNode[] | null, mentionedRemoteUsers: IMentionedRemoteUsers = []) {
    if (nodes == null) {
        return null;
    }

    const doc = window.document;

    function appendChildren(children: mfm.MfmNode[], targetElement: any): void {
        if (children) {
            for (const child of children.map(x => (handlers as any)[x.type](x))) targetElement.appendChild(child);
        }
    }

    const handlers: { [K in mfm.MfmNode['type']]: (node: mfm.NodeType<K>) => any } = {
        bold: (node) => {
            const el = doc.createElement('b');
            appendChildren(node.children, el);
            return el;
        },

        small: (node) => {
            const el = doc.createElement('small');
            appendChildren(node.children, el);
            return el;
        },

        strike: (node) => {
            const el = doc.createElement('del');
            appendChildren(node.children, el);
            return el;
        },

        italic: (node) => {
            const el = doc.createElement('i');
            appendChildren(node.children, el);
            return el;
        },

        fn: (node) => {
            const el = doc.createElement('i');
            appendChildren(node.children, el);
            return el;
        },

        blockCode: (node) => {
            const pre = doc.createElement('pre');
            const inner = doc.createElement('code');
            inner.textContent = node.props.code;
            pre.appendChild(inner);
            return pre;
        },

        center: (node) => {
            const el = doc.createElement('div');
            appendChildren(node.children, el);
            return el;
        },

        emojiCode: (node) => {
            return doc.createTextNode(`\u200B:${node.props.name}:\u200B`);
        },

        unicodeEmoji: (node) => {
            return doc.createTextNode(node.props.emoji);
        },

        hashtag: (node) => {
            const a = doc.createElement('a');
            a.setAttribute('href', `${this.config.url}/tags/${node.props.hashtag}`);
            a.textContent = `#${node.props.hashtag}`;
            a.setAttribute('rel', 'tag');
            return a;
        },

        inlineCode: (node) => {
            const el = doc.createElement('code');
            el.textContent = node.props.code;
            return el;
        },

        mathInline: (node) => {
            const el = doc.createElement('code');
            el.textContent = node.props.formula;
            return el;
        },

        mathBlock: (node) => {
            const el = doc.createElement('code');
            el.textContent = node.props.formula;
            return el;
        },

        link: (node) => {
            const a = doc.createElement('a');
            a.setAttribute('href', node.props.url);
            appendChildren(node.children, a);
            return a;
        },

        mention: (node) => {
            const a = doc.createElement('a');
            const { username, host, acct } = node.props;
            const remoteUserInfo = mentionedRemoteUsers.find(remoteUser => remoteUser.username === username && remoteUser.host === host);
            a.setAttribute('href', remoteUserInfo ? (remoteUserInfo.url ? remoteUserInfo.url : remoteUserInfo.uri) : `${this.config.url}/${acct}`);
            a.className = 'u-url mention';
            a.textContent = acct;
            return a;
        },

        quote: (node) => {
            const el = doc.createElement('blockquote');
            appendChildren(node.children, el);
            return el;
        },

        text: (node) => {
            const el = doc.createElement('span');
            const nodes = node.props.text.split(/\r\n|\r|\n/).map(x => doc.createTextNode(x));

            for (const x of intersperse<'br'>('br', nodes)) {
                el.appendChild(x === 'br' ? doc.createElement('br') : x);
            }

            return el;
        },

        url: (node) => {
            const a = doc.createElement('a');
            a.setAttribute('href', node.props.url);
            a.textContent = node.props.url;
            return a;
        },

        search: (node) => {
            const a = doc.createElement('a');
            a.setAttribute('href', `https://www.google.com/search?q=${node.props.query}`);
            a.textContent = node.props.content;
            return a;
        },

        plain: (node) => {
            const el = doc.createElement('span');
            appendChildren(node.children, el);
            return el;
        },
    };

    appendChildren(nodes, doc.body);

    return `<p>${doc.body.innerHTML}</p>`;
}