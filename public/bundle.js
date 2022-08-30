
(function(l, r) { if (!l || l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (self.location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.getElementsByTagName('head')[0].appendChild(r) })(self.document);
var app = (function () {
    'use strict';

    function noop() { }
    const identity = x => x;
    function assign(tar, src) {
        // @ts-ignore
        for (const k in src)
            tar[k] = src[k];
        return tar;
    }
    function run(fn) {
        return fn();
    }
    function blank_object() {
        return Object.create(null);
    }
    function run_all(fns) {
        fns.forEach(run);
    }
    function is_function(thing) {
        return typeof thing === 'function';
    }
    function safe_not_equal(a, b) {
        return a != a ? b == b : a !== b || ((a && typeof a === 'object') || typeof a === 'function');
    }
    let src_url_equal_anchor;
    function src_url_equal(element_src, url) {
        if (!src_url_equal_anchor) {
            src_url_equal_anchor = document.createElement('a');
        }
        src_url_equal_anchor.href = url;
        return element_src === src_url_equal_anchor.href;
    }
    function is_empty(obj) {
        return Object.keys(obj).length === 0;
    }
    function subscribe(store, ...callbacks) {
        if (store == null) {
            return noop;
        }
        const unsub = store.subscribe(...callbacks);
        return unsub.unsubscribe ? () => unsub.unsubscribe() : unsub;
    }
    function component_subscribe(component, store, callback) {
        component.$$.on_destroy.push(subscribe(store, callback));
    }
    function create_slot(definition, ctx, $$scope, fn) {
        if (definition) {
            const slot_ctx = get_slot_context(definition, ctx, $$scope, fn);
            return definition[0](slot_ctx);
        }
    }
    function get_slot_context(definition, ctx, $$scope, fn) {
        return definition[1] && fn
            ? assign($$scope.ctx.slice(), definition[1](fn(ctx)))
            : $$scope.ctx;
    }
    function get_slot_changes(definition, $$scope, dirty, fn) {
        if (definition[2] && fn) {
            const lets = definition[2](fn(dirty));
            if ($$scope.dirty === undefined) {
                return lets;
            }
            if (typeof lets === 'object') {
                const merged = [];
                const len = Math.max($$scope.dirty.length, lets.length);
                for (let i = 0; i < len; i += 1) {
                    merged[i] = $$scope.dirty[i] | lets[i];
                }
                return merged;
            }
            return $$scope.dirty | lets;
        }
        return $$scope.dirty;
    }
    function update_slot_base(slot, slot_definition, ctx, $$scope, slot_changes, get_slot_context_fn) {
        if (slot_changes) {
            const slot_context = get_slot_context(slot_definition, ctx, $$scope, get_slot_context_fn);
            slot.p(slot_context, slot_changes);
        }
    }
    function get_all_dirty_from_scope($$scope) {
        if ($$scope.ctx.length > 32) {
            const dirty = [];
            const length = $$scope.ctx.length / 32;
            for (let i = 0; i < length; i++) {
                dirty[i] = -1;
            }
            return dirty;
        }
        return -1;
    }
    function exclude_internal_props(props) {
        const result = {};
        for (const k in props)
            if (k[0] !== '$')
                result[k] = props[k];
        return result;
    }
    function null_to_empty(value) {
        return value == null ? '' : value;
    }
    function action_destroyer(action_result) {
        return action_result && is_function(action_result.destroy) ? action_result.destroy : noop;
    }

    const is_client = typeof window !== 'undefined';
    let now = is_client
        ? () => window.performance.now()
        : () => Date.now();
    let raf = is_client ? cb => requestAnimationFrame(cb) : noop;

    const tasks = new Set();
    function run_tasks(now) {
        tasks.forEach(task => {
            if (!task.c(now)) {
                tasks.delete(task);
                task.f();
            }
        });
        if (tasks.size !== 0)
            raf(run_tasks);
    }
    /**
     * Creates a new task that runs on each raf frame
     * until it returns a falsy value or is aborted
     */
    function loop(callback) {
        let task;
        if (tasks.size === 0)
            raf(run_tasks);
        return {
            promise: new Promise(fulfill => {
                tasks.add(task = { c: callback, f: fulfill });
            }),
            abort() {
                tasks.delete(task);
            }
        };
    }
    function append(target, node) {
        target.appendChild(node);
    }
    function get_root_for_style(node) {
        if (!node)
            return document;
        const root = node.getRootNode ? node.getRootNode() : node.ownerDocument;
        if (root && root.host) {
            return root;
        }
        return node.ownerDocument;
    }
    function append_empty_stylesheet(node) {
        const style_element = element('style');
        append_stylesheet(get_root_for_style(node), style_element);
        return style_element.sheet;
    }
    function append_stylesheet(node, style) {
        append(node.head || node, style);
    }
    function insert(target, node, anchor) {
        target.insertBefore(node, anchor || null);
    }
    function detach(node) {
        node.parentNode.removeChild(node);
    }
    function destroy_each(iterations, detaching) {
        for (let i = 0; i < iterations.length; i += 1) {
            if (iterations[i])
                iterations[i].d(detaching);
        }
    }
    function element(name) {
        return document.createElement(name);
    }
    function text(data) {
        return document.createTextNode(data);
    }
    function space() {
        return text(' ');
    }
    function empty$1() {
        return text('');
    }
    function listen(node, event, handler, options) {
        node.addEventListener(event, handler, options);
        return () => node.removeEventListener(event, handler, options);
    }
    function prevent_default(fn) {
        return function (event) {
            event.preventDefault();
            // @ts-ignore
            return fn.call(this, event);
        };
    }
    function stop_propagation(fn) {
        return function (event) {
            event.stopPropagation();
            // @ts-ignore
            return fn.call(this, event);
        };
    }
    function attr(node, attribute, value) {
        if (value == null)
            node.removeAttribute(attribute);
        else if (node.getAttribute(attribute) !== value)
            node.setAttribute(attribute, value);
    }
    function set_attributes(node, attributes) {
        // @ts-ignore
        const descriptors = Object.getOwnPropertyDescriptors(node.__proto__);
        for (const key in attributes) {
            if (attributes[key] == null) {
                node.removeAttribute(key);
            }
            else if (key === 'style') {
                node.style.cssText = attributes[key];
            }
            else if (key === '__value') {
                node.value = node[key] = attributes[key];
            }
            else if (descriptors[key] && descriptors[key].set) {
                node[key] = attributes[key];
            }
            else {
                attr(node, key, attributes[key]);
            }
        }
    }
    function to_number(value) {
        return value === '' ? null : +value;
    }
    function children(element) {
        return Array.from(element.childNodes);
    }
    function set_data(text, data) {
        data = '' + data;
        if (text.wholeText !== data)
            text.data = data;
    }
    function set_input_value(input, value) {
        input.value = value == null ? '' : value;
    }
    function set_style(node, key, value, important) {
        if (value === null) {
            node.style.removeProperty(key);
        }
        else {
            node.style.setProperty(key, value, important ? 'important' : '');
        }
    }
    function select_option(select, value) {
        for (let i = 0; i < select.options.length; i += 1) {
            const option = select.options[i];
            if (option.__value === value) {
                option.selected = true;
                return;
            }
        }
        select.selectedIndex = -1; // no option should be selected
    }
    function select_value(select) {
        const selected_option = select.querySelector(':checked') || select.options[0];
        return selected_option && selected_option.__value;
    }
    function toggle_class(element, name, toggle) {
        element.classList[toggle ? 'add' : 'remove'](name);
    }
    function custom_event(type, detail, { bubbles = false, cancelable = false } = {}) {
        const e = document.createEvent('CustomEvent');
        e.initCustomEvent(type, bubbles, cancelable, detail);
        return e;
    }

    // we need to store the information for multiple documents because a Svelte application could also contain iframes
    // https://github.com/sveltejs/svelte/issues/3624
    const managed_styles = new Map();
    let active = 0;
    // https://github.com/darkskyapp/string-hash/blob/master/index.js
    function hash(str) {
        let hash = 5381;
        let i = str.length;
        while (i--)
            hash = ((hash << 5) - hash) ^ str.charCodeAt(i);
        return hash >>> 0;
    }
    function create_style_information(doc, node) {
        const info = { stylesheet: append_empty_stylesheet(node), rules: {} };
        managed_styles.set(doc, info);
        return info;
    }
    function create_rule(node, a, b, duration, delay, ease, fn, uid = 0) {
        const step = 16.666 / duration;
        let keyframes = '{\n';
        for (let p = 0; p <= 1; p += step) {
            const t = a + (b - a) * ease(p);
            keyframes += p * 100 + `%{${fn(t, 1 - t)}}\n`;
        }
        const rule = keyframes + `100% {${fn(b, 1 - b)}}\n}`;
        const name = `__svelte_${hash(rule)}_${uid}`;
        const doc = get_root_for_style(node);
        const { stylesheet, rules } = managed_styles.get(doc) || create_style_information(doc, node);
        if (!rules[name]) {
            rules[name] = true;
            stylesheet.insertRule(`@keyframes ${name} ${rule}`, stylesheet.cssRules.length);
        }
        const animation = node.style.animation || '';
        node.style.animation = `${animation ? `${animation}, ` : ''}${name} ${duration}ms linear ${delay}ms 1 both`;
        active += 1;
        return name;
    }
    function delete_rule(node, name) {
        const previous = (node.style.animation || '').split(', ');
        const next = previous.filter(name
            ? anim => anim.indexOf(name) < 0 // remove specific animation
            : anim => anim.indexOf('__svelte') === -1 // remove all Svelte animations
        );
        const deleted = previous.length - next.length;
        if (deleted) {
            node.style.animation = next.join(', ');
            active -= deleted;
            if (!active)
                clear_rules();
        }
    }
    function clear_rules() {
        raf(() => {
            if (active)
                return;
            managed_styles.forEach(info => {
                const { stylesheet } = info;
                let i = stylesheet.cssRules.length;
                while (i--)
                    stylesheet.deleteRule(i);
                info.rules = {};
            });
            managed_styles.clear();
        });
    }

    let current_component;
    function set_current_component(component) {
        current_component = component;
    }
    function get_current_component() {
        if (!current_component)
            throw new Error('Function called outside component initialization');
        return current_component;
    }
    function onMount(fn) {
        get_current_component().$$.on_mount.push(fn);
    }
    function afterUpdate(fn) {
        get_current_component().$$.after_update.push(fn);
    }
    function onDestroy(fn) {
        get_current_component().$$.on_destroy.push(fn);
    }
    function createEventDispatcher() {
        const component = get_current_component();
        return (type, detail, { cancelable = false } = {}) => {
            const callbacks = component.$$.callbacks[type];
            if (callbacks) {
                // TODO are there situations where events could be dispatched
                // in a server (non-DOM) environment?
                const event = custom_event(type, detail, { cancelable });
                callbacks.slice().forEach(fn => {
                    fn.call(component, event);
                });
                return !event.defaultPrevented;
            }
            return true;
        };
    }
    function setContext(key, context) {
        get_current_component().$$.context.set(key, context);
        return context;
    }
    function getContext(key) {
        return get_current_component().$$.context.get(key);
    }
    // TODO figure out if we still want to support
    // shorthand events, or if we want to implement
    // a real bubbling mechanism
    function bubble(component, event) {
        const callbacks = component.$$.callbacks[event.type];
        if (callbacks) {
            // @ts-ignore
            callbacks.slice().forEach(fn => fn.call(this, event));
        }
    }

    const dirty_components = [];
    const binding_callbacks = [];
    const render_callbacks = [];
    const flush_callbacks = [];
    const resolved_promise = Promise.resolve();
    let update_scheduled = false;
    function schedule_update() {
        if (!update_scheduled) {
            update_scheduled = true;
            resolved_promise.then(flush);
        }
    }
    function add_render_callback(fn) {
        render_callbacks.push(fn);
    }
    // flush() calls callbacks in this order:
    // 1. All beforeUpdate callbacks, in order: parents before children
    // 2. All bind:this callbacks, in reverse order: children before parents.
    // 3. All afterUpdate callbacks, in order: parents before children. EXCEPT
    //    for afterUpdates called during the initial onMount, which are called in
    //    reverse order: children before parents.
    // Since callbacks might update component values, which could trigger another
    // call to flush(), the following steps guard against this:
    // 1. During beforeUpdate, any updated components will be added to the
    //    dirty_components array and will cause a reentrant call to flush(). Because
    //    the flush index is kept outside the function, the reentrant call will pick
    //    up where the earlier call left off and go through all dirty components. The
    //    current_component value is saved and restored so that the reentrant call will
    //    not interfere with the "parent" flush() call.
    // 2. bind:this callbacks cannot trigger new flush() calls.
    // 3. During afterUpdate, any updated components will NOT have their afterUpdate
    //    callback called a second time; the seen_callbacks set, outside the flush()
    //    function, guarantees this behavior.
    const seen_callbacks = new Set();
    let flushidx = 0; // Do *not* move this inside the flush() function
    function flush() {
        const saved_component = current_component;
        do {
            // first, call beforeUpdate functions
            // and update components
            while (flushidx < dirty_components.length) {
                const component = dirty_components[flushidx];
                flushidx++;
                set_current_component(component);
                update(component.$$);
            }
            set_current_component(null);
            dirty_components.length = 0;
            flushidx = 0;
            while (binding_callbacks.length)
                binding_callbacks.pop()();
            // then, once components are updated, call
            // afterUpdate functions. This may cause
            // subsequent updates...
            for (let i = 0; i < render_callbacks.length; i += 1) {
                const callback = render_callbacks[i];
                if (!seen_callbacks.has(callback)) {
                    // ...so guard against infinite loops
                    seen_callbacks.add(callback);
                    callback();
                }
            }
            render_callbacks.length = 0;
        } while (dirty_components.length);
        while (flush_callbacks.length) {
            flush_callbacks.pop()();
        }
        update_scheduled = false;
        seen_callbacks.clear();
        set_current_component(saved_component);
    }
    function update($$) {
        if ($$.fragment !== null) {
            $$.update();
            run_all($$.before_update);
            const dirty = $$.dirty;
            $$.dirty = [-1];
            $$.fragment && $$.fragment.p($$.ctx, dirty);
            $$.after_update.forEach(add_render_callback);
        }
    }

    let promise;
    function wait() {
        if (!promise) {
            promise = Promise.resolve();
            promise.then(() => {
                promise = null;
            });
        }
        return promise;
    }
    function dispatch(node, direction, kind) {
        node.dispatchEvent(custom_event(`${direction ? 'intro' : 'outro'}${kind}`));
    }
    const outroing = new Set();
    let outros;
    function group_outros() {
        outros = {
            r: 0,
            c: [],
            p: outros // parent group
        };
    }
    function check_outros() {
        if (!outros.r) {
            run_all(outros.c);
        }
        outros = outros.p;
    }
    function transition_in(block, local) {
        if (block && block.i) {
            outroing.delete(block);
            block.i(local);
        }
    }
    function transition_out(block, local, detach, callback) {
        if (block && block.o) {
            if (outroing.has(block))
                return;
            outroing.add(block);
            outros.c.push(() => {
                outroing.delete(block);
                if (callback) {
                    if (detach)
                        block.d(1);
                    callback();
                }
            });
            block.o(local);
        }
        else if (callback) {
            callback();
        }
    }
    const null_transition = { duration: 0 };
    function create_in_transition(node, fn, params) {
        let config = fn(node, params);
        let running = false;
        let animation_name;
        let task;
        let uid = 0;
        function cleanup() {
            if (animation_name)
                delete_rule(node, animation_name);
        }
        function go() {
            const { delay = 0, duration = 300, easing = identity, tick = noop, css } = config || null_transition;
            if (css)
                animation_name = create_rule(node, 0, 1, duration, delay, easing, css, uid++);
            tick(0, 1);
            const start_time = now() + delay;
            const end_time = start_time + duration;
            if (task)
                task.abort();
            running = true;
            add_render_callback(() => dispatch(node, true, 'start'));
            task = loop(now => {
                if (running) {
                    if (now >= end_time) {
                        tick(1, 0);
                        dispatch(node, true, 'end');
                        cleanup();
                        return running = false;
                    }
                    if (now >= start_time) {
                        const t = easing((now - start_time) / duration);
                        tick(t, 1 - t);
                    }
                }
                return running;
            });
        }
        let started = false;
        return {
            start() {
                if (started)
                    return;
                started = true;
                delete_rule(node);
                if (is_function(config)) {
                    config = config();
                    wait().then(go);
                }
                else {
                    go();
                }
            },
            invalidate() {
                started = false;
            },
            end() {
                if (running) {
                    cleanup();
                    running = false;
                }
            }
        };
    }
    function create_out_transition(node, fn, params) {
        let config = fn(node, params);
        let running = true;
        let animation_name;
        const group = outros;
        group.r += 1;
        function go() {
            const { delay = 0, duration = 300, easing = identity, tick = noop, css } = config || null_transition;
            if (css)
                animation_name = create_rule(node, 1, 0, duration, delay, easing, css);
            const start_time = now() + delay;
            const end_time = start_time + duration;
            add_render_callback(() => dispatch(node, false, 'start'));
            loop(now => {
                if (running) {
                    if (now >= end_time) {
                        tick(0, 1);
                        dispatch(node, false, 'end');
                        if (!--group.r) {
                            // this will result in `end()` being called,
                            // so we don't need to clean up here
                            run_all(group.c);
                        }
                        return false;
                    }
                    if (now >= start_time) {
                        const t = easing((now - start_time) / duration);
                        tick(1 - t, t);
                    }
                }
                return running;
            });
        }
        if (is_function(config)) {
            wait().then(() => {
                // @ts-ignore
                config = config();
                go();
            });
        }
        else {
            go();
        }
        return {
            end(reset) {
                if (reset && config.tick) {
                    config.tick(1, 0);
                }
                if (running) {
                    if (animation_name)
                        delete_rule(node, animation_name);
                    running = false;
                }
            }
        };
    }
    function create_bidirectional_transition(node, fn, params, intro) {
        let config = fn(node, params);
        let t = intro ? 0 : 1;
        let running_program = null;
        let pending_program = null;
        let animation_name = null;
        function clear_animation() {
            if (animation_name)
                delete_rule(node, animation_name);
        }
        function init(program, duration) {
            const d = (program.b - t);
            duration *= Math.abs(d);
            return {
                a: t,
                b: program.b,
                d,
                duration,
                start: program.start,
                end: program.start + duration,
                group: program.group
            };
        }
        function go(b) {
            const { delay = 0, duration = 300, easing = identity, tick = noop, css } = config || null_transition;
            const program = {
                start: now() + delay,
                b
            };
            if (!b) {
                // @ts-ignore todo: improve typings
                program.group = outros;
                outros.r += 1;
            }
            if (running_program || pending_program) {
                pending_program = program;
            }
            else {
                // if this is an intro, and there's a delay, we need to do
                // an initial tick and/or apply CSS animation immediately
                if (css) {
                    clear_animation();
                    animation_name = create_rule(node, t, b, duration, delay, easing, css);
                }
                if (b)
                    tick(0, 1);
                running_program = init(program, duration);
                add_render_callback(() => dispatch(node, b, 'start'));
                loop(now => {
                    if (pending_program && now > pending_program.start) {
                        running_program = init(pending_program, duration);
                        pending_program = null;
                        dispatch(node, running_program.b, 'start');
                        if (css) {
                            clear_animation();
                            animation_name = create_rule(node, t, running_program.b, running_program.duration, 0, easing, config.css);
                        }
                    }
                    if (running_program) {
                        if (now >= running_program.end) {
                            tick(t = running_program.b, 1 - t);
                            dispatch(node, running_program.b, 'end');
                            if (!pending_program) {
                                // we're done
                                if (running_program.b) {
                                    // intro — we can tidy up immediately
                                    clear_animation();
                                }
                                else {
                                    // outro — needs to be coordinated
                                    if (!--running_program.group.r)
                                        run_all(running_program.group.c);
                                }
                            }
                            running_program = null;
                        }
                        else if (now >= running_program.start) {
                            const p = now - running_program.start;
                            t = running_program.a + running_program.d * easing(p / running_program.duration);
                            tick(t, 1 - t);
                        }
                    }
                    return !!(running_program || pending_program);
                });
            }
        }
        return {
            run(b) {
                if (is_function(config)) {
                    wait().then(() => {
                        // @ts-ignore
                        config = config();
                        go(b);
                    });
                }
                else {
                    go(b);
                }
            },
            end() {
                clear_animation();
                running_program = pending_program = null;
            }
        };
    }

    function get_spread_update(levels, updates) {
        const update = {};
        const to_null_out = {};
        const accounted_for = { $$scope: 1 };
        let i = levels.length;
        while (i--) {
            const o = levels[i];
            const n = updates[i];
            if (n) {
                for (const key in o) {
                    if (!(key in n))
                        to_null_out[key] = 1;
                }
                for (const key in n) {
                    if (!accounted_for[key]) {
                        update[key] = n[key];
                        accounted_for[key] = 1;
                    }
                }
                levels[i] = n;
            }
            else {
                for (const key in o) {
                    accounted_for[key] = 1;
                }
            }
        }
        for (const key in to_null_out) {
            if (!(key in update))
                update[key] = undefined;
        }
        return update;
    }
    function get_spread_object(spread_props) {
        return typeof spread_props === 'object' && spread_props !== null ? spread_props : {};
    }
    function create_component(block) {
        block && block.c();
    }
    function mount_component(component, target, anchor, customElement) {
        const { fragment, on_mount, on_destroy, after_update } = component.$$;
        fragment && fragment.m(target, anchor);
        if (!customElement) {
            // onMount happens before the initial afterUpdate
            add_render_callback(() => {
                const new_on_destroy = on_mount.map(run).filter(is_function);
                if (on_destroy) {
                    on_destroy.push(...new_on_destroy);
                }
                else {
                    // Edge case - component was destroyed immediately,
                    // most likely as a result of a binding initialising
                    run_all(new_on_destroy);
                }
                component.$$.on_mount = [];
            });
        }
        after_update.forEach(add_render_callback);
    }
    function destroy_component(component, detaching) {
        const $$ = component.$$;
        if ($$.fragment !== null) {
            run_all($$.on_destroy);
            $$.fragment && $$.fragment.d(detaching);
            // TODO null out other refs, including component.$$ (but need to
            // preserve final state?)
            $$.on_destroy = $$.fragment = null;
            $$.ctx = [];
        }
    }
    function make_dirty(component, i) {
        if (component.$$.dirty[0] === -1) {
            dirty_components.push(component);
            schedule_update();
            component.$$.dirty.fill(0);
        }
        component.$$.dirty[(i / 31) | 0] |= (1 << (i % 31));
    }
    function init(component, options, instance, create_fragment, not_equal, props, append_styles, dirty = [-1]) {
        const parent_component = current_component;
        set_current_component(component);
        const $$ = component.$$ = {
            fragment: null,
            ctx: null,
            // state
            props,
            update: noop,
            not_equal,
            bound: blank_object(),
            // lifecycle
            on_mount: [],
            on_destroy: [],
            on_disconnect: [],
            before_update: [],
            after_update: [],
            context: new Map(options.context || (parent_component ? parent_component.$$.context : [])),
            // everything else
            callbacks: blank_object(),
            dirty,
            skip_bound: false,
            root: options.target || parent_component.$$.root
        };
        append_styles && append_styles($$.root);
        let ready = false;
        $$.ctx = instance
            ? instance(component, options.props || {}, (i, ret, ...rest) => {
                const value = rest.length ? rest[0] : ret;
                if ($$.ctx && not_equal($$.ctx[i], $$.ctx[i] = value)) {
                    if (!$$.skip_bound && $$.bound[i])
                        $$.bound[i](value);
                    if (ready)
                        make_dirty(component, i);
                }
                return ret;
            })
            : [];
        $$.update();
        ready = true;
        run_all($$.before_update);
        // `false` as a special case of no DOM component
        $$.fragment = create_fragment ? create_fragment($$.ctx) : false;
        if (options.target) {
            if (options.hydrate) {
                const nodes = children(options.target);
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.l(nodes);
                nodes.forEach(detach);
            }
            else {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.c();
            }
            if (options.intro)
                transition_in(component.$$.fragment);
            mount_component(component, options.target, options.anchor, options.customElement);
            flush();
        }
        set_current_component(parent_component);
    }
    /**
     * Base class for Svelte components. Used when dev=false.
     */
    class SvelteComponent {
        $destroy() {
            destroy_component(this, 1);
            this.$destroy = noop;
        }
        $on(type, callback) {
            const callbacks = (this.$$.callbacks[type] || (this.$$.callbacks[type] = []));
            callbacks.push(callback);
            return () => {
                const index = callbacks.indexOf(callback);
                if (index !== -1)
                    callbacks.splice(index, 1);
            };
        }
        $set($$props) {
            if (this.$$set && !is_empty($$props)) {
                this.$$.skip_bound = true;
                this.$$set($$props);
                this.$$.skip_bound = false;
            }
        }
    }

    const subscriber_queue = [];
    /**
     * Creates a `Readable` store that allows reading by subscription.
     * @param value initial value
     * @param {StartStopNotifier}start start and stop notifications for subscriptions
     */
    function readable(value, start) {
        return {
            subscribe: writable(value, start).subscribe
        };
    }
    /**
     * Create a `Writable` store that allows both updating and reading by subscription.
     * @param {*=}value initial value
     * @param {StartStopNotifier=}start start and stop notifications for subscriptions
     */
    function writable(value, start = noop) {
        let stop;
        const subscribers = new Set();
        function set(new_value) {
            if (safe_not_equal(value, new_value)) {
                value = new_value;
                if (stop) { // store is ready
                    const run_queue = !subscriber_queue.length;
                    for (const subscriber of subscribers) {
                        subscriber[1]();
                        subscriber_queue.push(subscriber, value);
                    }
                    if (run_queue) {
                        for (let i = 0; i < subscriber_queue.length; i += 2) {
                            subscriber_queue[i][0](subscriber_queue[i + 1]);
                        }
                        subscriber_queue.length = 0;
                    }
                }
            }
        }
        function update(fn) {
            set(fn(value));
        }
        function subscribe(run, invalidate = noop) {
            const subscriber = [run, invalidate];
            subscribers.add(subscriber);
            if (subscribers.size === 1) {
                stop = start(set) || noop;
            }
            run(value);
            return () => {
                subscribers.delete(subscriber);
                if (subscribers.size === 0) {
                    stop();
                    stop = null;
                }
            };
        }
        return { set, update, subscribe };
    }
    function derived(stores, fn, initial_value) {
        const single = !Array.isArray(stores);
        const stores_array = single
            ? [stores]
            : stores;
        const auto = fn.length < 2;
        return readable(initial_value, (set) => {
            let inited = false;
            const values = [];
            let pending = 0;
            let cleanup = noop;
            const sync = () => {
                if (pending) {
                    return;
                }
                cleanup();
                const result = fn(single ? values[0] : values, set);
                if (auto) {
                    set(result);
                }
                else {
                    cleanup = is_function(result) ? result : noop;
                }
            };
            const unsubscribers = stores_array.map((store, i) => subscribe(store, (value) => {
                values[i] = value;
                pending &= ~(1 << i);
                if (inited) {
                    sync();
                }
            }, () => {
                pending |= (1 << i);
            }));
            inited = true;
            sync();
            return function stop() {
                run_all(unsubscribers);
                cleanup();
            };
        });
    }

    const LOCATION = {};
    const ROUTER = {};

    /**
     * Adapted from https://github.com/reach/router/blob/b60e6dd781d5d3a4bdaaf4de665649c0f6a7e78d/src/lib/history.js
     *
     * https://github.com/reach/router/blob/master/LICENSE
     * */

    function getLocation(source) {
      return {
        ...source.location,
        state: source.history.state,
        key: (source.history.state && source.history.state.key) || "initial"
      };
    }

    function createHistory(source, options) {
      const listeners = [];
      let location = getLocation(source);

      return {
        get location() {
          return location;
        },

        listen(listener) {
          listeners.push(listener);

          const popstateListener = () => {
            location = getLocation(source);
            listener({ location, action: "POP" });
          };

          source.addEventListener("popstate", popstateListener);

          return () => {
            source.removeEventListener("popstate", popstateListener);

            const index = listeners.indexOf(listener);
            listeners.splice(index, 1);
          };
        },

        navigate(to, { state, replace = false } = {}) {
          state = { ...state, key: Date.now() + "" };
          // try...catch iOS Safari limits to 100 pushState calls
          try {
            if (replace) {
              source.history.replaceState(state, null, to);
            } else {
              source.history.pushState(state, null, to);
            }
          } catch (e) {
            source.location[replace ? "replace" : "assign"](to);
          }

          location = getLocation(source);
          listeners.forEach(listener => listener({ location, action: "PUSH" }));
        }
      };
    }

    // Stores history entries in memory for testing or other platforms like Native
    function createMemorySource(initialPathname = "/") {
      let index = 0;
      const stack = [{ pathname: initialPathname, search: "" }];
      const states = [];

      return {
        get location() {
          return stack[index];
        },
        addEventListener(name, fn) {},
        removeEventListener(name, fn) {},
        history: {
          get entries() {
            return stack;
          },
          get index() {
            return index;
          },
          get state() {
            return states[index];
          },
          pushState(state, _, uri) {
            const [pathname, search = ""] = uri.split("?");
            index++;
            stack.push({ pathname, search });
            states.push(state);
          },
          replaceState(state, _, uri) {
            const [pathname, search = ""] = uri.split("?");
            stack[index] = { pathname, search };
            states[index] = state;
          }
        }
      };
    }

    // Global history uses window.history as the source if available,
    // otherwise a memory history
    const canUseDOM = Boolean(
      typeof window !== "undefined" &&
        window.document &&
        window.document.createElement
    );
    const globalHistory = createHistory(canUseDOM ? window : createMemorySource());
    const { navigate } = globalHistory;

    /**
     * Adapted from https://github.com/reach/router/blob/b60e6dd781d5d3a4bdaaf4de665649c0f6a7e78d/src/lib/utils.js
     *
     * https://github.com/reach/router/blob/master/LICENSE
     * */

    const paramRe = /^:(.+)/;

    const SEGMENT_POINTS = 4;
    const STATIC_POINTS = 3;
    const DYNAMIC_POINTS = 2;
    const SPLAT_PENALTY = 1;
    const ROOT_POINTS = 1;

    /**
     * Check if `string` starts with `search`
     * @param {string} string
     * @param {string} search
     * @return {boolean}
     */
    function startsWith(string, search) {
      return string.substr(0, search.length) === search;
    }

    /**
     * Check if `segment` is a root segment
     * @param {string} segment
     * @return {boolean}
     */
    function isRootSegment(segment) {
      return segment === "";
    }

    /**
     * Check if `segment` is a dynamic segment
     * @param {string} segment
     * @return {boolean}
     */
    function isDynamic(segment) {
      return paramRe.test(segment);
    }

    /**
     * Check if `segment` is a splat
     * @param {string} segment
     * @return {boolean}
     */
    function isSplat(segment) {
      return segment[0] === "*";
    }

    /**
     * Split up the URI into segments delimited by `/`
     * @param {string} uri
     * @return {string[]}
     */
    function segmentize(uri) {
      return (
        uri
          // Strip starting/ending `/`
          .replace(/(^\/+|\/+$)/g, "")
          .split("/")
      );
    }

    /**
     * Strip `str` of potential start and end `/`
     * @param {string} str
     * @return {string}
     */
    function stripSlashes(str) {
      return str.replace(/(^\/+|\/+$)/g, "");
    }

    /**
     * Score a route depending on how its individual segments look
     * @param {object} route
     * @param {number} index
     * @return {object}
     */
    function rankRoute(route, index) {
      const score = route.default
        ? 0
        : segmentize(route.path).reduce((score, segment) => {
            score += SEGMENT_POINTS;

            if (isRootSegment(segment)) {
              score += ROOT_POINTS;
            } else if (isDynamic(segment)) {
              score += DYNAMIC_POINTS;
            } else if (isSplat(segment)) {
              score -= SEGMENT_POINTS + SPLAT_PENALTY;
            } else {
              score += STATIC_POINTS;
            }

            return score;
          }, 0);

      return { route, score, index };
    }

    /**
     * Give a score to all routes and sort them on that
     * @param {object[]} routes
     * @return {object[]}
     */
    function rankRoutes(routes) {
      return (
        routes
          .map(rankRoute)
          // If two routes have the exact same score, we go by index instead
          .sort((a, b) =>
            a.score < b.score ? 1 : a.score > b.score ? -1 : a.index - b.index
          )
      );
    }

    /**
     * Ranks and picks the best route to match. Each segment gets the highest
     * amount of points, then the type of segment gets an additional amount of
     * points where
     *
     *  static > dynamic > splat > root
     *
     * This way we don't have to worry about the order of our routes, let the
     * computers do it.
     *
     * A route looks like this
     *
     *  { path, default, value }
     *
     * And a returned match looks like:
     *
     *  { route, params, uri }
     *
     * @param {object[]} routes
     * @param {string} uri
     * @return {?object}
     */
    function pick$1(routes, uri) {
      let match;
      let default_;

      const [uriPathname] = uri.split("?");
      const uriSegments = segmentize(uriPathname);
      const isRootUri = uriSegments[0] === "";
      const ranked = rankRoutes(routes);

      for (let i = 0, l = ranked.length; i < l; i++) {
        const route = ranked[i].route;
        let missed = false;

        if (route.default) {
          default_ = {
            route,
            params: {},
            uri,
          };
          continue;
        }

        const routeSegments = segmentize(route.path);
        const params = {};
        const max = Math.max(uriSegments.length, routeSegments.length);
        let index = 0;

        for (; index < max; index++) {
          const routeSegment = routeSegments[index];
          const uriSegment = uriSegments[index];

          if (routeSegment !== undefined && isSplat(routeSegment)) {
            // Hit a splat, just grab the rest, and return a match
            // uri:   /files/documents/work
            // route: /files/* or /files/*splatname
            const splatName = routeSegment === "*" ? "*" : routeSegment.slice(1);

            params[splatName] = uriSegments.slice(index).map(decodeURIComponent).join("/");
            break;
          }
          if (!routeSegment.includes(":") && routeSegment !== uriSegment) {
            missed = true;
            break;
          }
          let dynamicMatch = paramRe.exec(routeSegment);

          if (dynamicMatch && !isRootUri) {
            const value = decodeURIComponent(uriSegment);
            params[dynamicMatch[1]] = value === "undefined" ? undefined : value;
          } else if (routeSegment !== uriSegment) {
            // Current segments don't match, not dynamic, not splat, so no match
            // uri:   /users/123/settings
            // route: /users/:id/profile
            missed = true;
            break;
          }
        }

        if (!missed) {
          match = {
            route,
            params,
            uri: "/" + uriSegments.slice(0, index).join("/"),
          };
          break;
        }
      }

      return match || default_ || null;
    }

    /**
     * Check if the `path` matches the `uri`.
     * @param {string} path
     * @param {string} uri
     * @return {?object}
     */
    function match(route, uri) {
      return pick$1([route], uri);
    }

    /**
     * Add the query to the pathname if a query is given
     * @param {string} pathname
     * @param {string} [query]
     * @return {string}
     */
    function addQuery(pathname, query) {
      return pathname + (query ? `?${query}` : "");
    }

    /**
     * Resolve URIs as though every path is a directory, no files. Relative URIs
     * in the browser can feel awkward because not only can you be "in a directory",
     * you can be "at a file", too. For example:
     *
     *  browserSpecResolve('foo', '/bar/') => /bar/foo
     *  browserSpecResolve('foo', '/bar') => /foo
     *
     * But on the command line of a file system, it's not as complicated. You can't
     * `cd` from a file, only directories. This way, links have to know less about
     * their current path. To go deeper you can do this:
     *
     *  <Link to="deeper"/>
     *  // instead of
     *  <Link to=`{${props.uri}/deeper}`/>
     *
     * Just like `cd`, if you want to go deeper from the command line, you do this:
     *
     *  cd deeper
     *  # not
     *  cd $(pwd)/deeper
     *
     * By treating every path as a directory, linking to relative paths should
     * require less contextual information and (fingers crossed) be more intuitive.
     * @param {string} to
     * @param {string} base
     * @return {string}
     */
    function resolve(to, base) {
      // /foo/bar, /baz/qux => /foo/bar
      if (startsWith(to, "/")) {
        return to;
      }

      const [toPathname, toQuery] = to.split("?");
      const [basePathname] = base.split("?");
      const toSegments = segmentize(toPathname);
      const baseSegments = segmentize(basePathname);

      // ?a=b, /users?b=c => /users?a=b
      if (toSegments[0] === "") {
        return addQuery(basePathname, toQuery);
      }

      // profile, /users/789 => /users/789/profile
      if (!startsWith(toSegments[0], ".")) {
        const pathname = baseSegments.concat(toSegments).join("/");

        return addQuery((basePathname === "/" ? "" : "/") + pathname, toQuery);
      }

      // ./       , /users/123 => /users/123
      // ../      , /users/123 => /users
      // ../..    , /users/123 => /
      // ../../one, /a/b/c/d   => /a/b/one
      // .././one , /a/b/c/d   => /a/b/c/one
      const allSegments = baseSegments.concat(toSegments);
      const segments = [];

      allSegments.forEach((segment) => {
        if (segment === "..") {
          segments.pop();
        } else if (segment !== ".") {
          segments.push(segment);
        }
      });

      return addQuery("/" + segments.join("/"), toQuery);
    }

    /**
     * Combines the `basepath` and the `path` into one path.
     * @param {string} basepath
     * @param {string} path
     */
    function combinePaths(basepath, path) {
      return `${stripSlashes(
    path === "/" ? basepath : `${stripSlashes(basepath)}/${stripSlashes(path)}`
  )}/`;
    }

    /**
     * Decides whether a given `event` should result in a navigation or not.
     * @param {object} event
     */
    function shouldNavigate(event) {
      return (
        !event.defaultPrevented &&
        event.button === 0 &&
        !(event.metaKey || event.altKey || event.ctrlKey || event.shiftKey)
      );
    }

    /* node_modules\svelte-routing\src\Router.svelte generated by Svelte v3.49.0 */

    function create_fragment$B(ctx) {
    	let current;
    	const default_slot_template = /*#slots*/ ctx[9].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[8], null);

    	return {
    		c() {
    			if (default_slot) default_slot.c();
    		},
    		m(target, anchor) {
    			if (default_slot) {
    				default_slot.m(target, anchor);
    			}

    			current = true;
    		},
    		p(ctx, [dirty]) {
    			if (default_slot) {
    				if (default_slot.p && (!current || dirty & /*$$scope*/ 256)) {
    					update_slot_base(
    						default_slot,
    						default_slot_template,
    						ctx,
    						/*$$scope*/ ctx[8],
    						!current
    						? get_all_dirty_from_scope(/*$$scope*/ ctx[8])
    						: get_slot_changes(default_slot_template, /*$$scope*/ ctx[8], dirty, null),
    						null
    					);
    				}
    			}
    		},
    		i(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d(detaching) {
    			if (default_slot) default_slot.d(detaching);
    		}
    	};
    }

    function instance$B($$self, $$props, $$invalidate) {
    	let $location;
    	let $routes;
    	let $base;
    	let { $$slots: slots = {}, $$scope } = $$props;
    	let { basepath = "/" } = $$props;
    	let { url = null } = $$props;
    	const locationContext = getContext(LOCATION);
    	const routerContext = getContext(ROUTER);
    	const routes = writable([]);
    	component_subscribe($$self, routes, value => $$invalidate(6, $routes = value));
    	const activeRoute = writable(null);
    	let hasActiveRoute = false; // Used in SSR to synchronously set that a Route is active.

    	// If locationContext is not set, this is the topmost Router in the tree.
    	// If the `url` prop is given we force the location to it.
    	const location = locationContext || writable(url ? { pathname: url } : globalHistory.location);

    	component_subscribe($$self, location, value => $$invalidate(5, $location = value));

    	// If routerContext is set, the routerBase of the parent Router
    	// will be the base for this Router's descendants.
    	// If routerContext is not set, the path and resolved uri will both
    	// have the value of the basepath prop.
    	const base = routerContext
    	? routerContext.routerBase
    	: writable({ path: basepath, uri: basepath });

    	component_subscribe($$self, base, value => $$invalidate(7, $base = value));

    	const routerBase = derived([base, activeRoute], ([base, activeRoute]) => {
    		// If there is no activeRoute, the routerBase will be identical to the base.
    		if (activeRoute === null) {
    			return base;
    		}

    		const { path: basepath } = base;
    		const { route, uri } = activeRoute;

    		// Remove the potential /* or /*splatname from
    		// the end of the child Routes relative paths.
    		const path = route.default
    		? basepath
    		: route.path.replace(/\*.*$/, "");

    		return { path, uri };
    	});

    	function registerRoute(route) {
    		const { path: basepath } = $base;
    		let { path } = route;

    		// We store the original path in the _path property so we can reuse
    		// it when the basepath changes. The only thing that matters is that
    		// the route reference is intact, so mutation is fine.
    		route._path = path;

    		route.path = combinePaths(basepath, path);

    		if (typeof window === "undefined") {
    			// In SSR we should set the activeRoute immediately if it is a match.
    			// If there are more Routes being registered after a match is found,
    			// we just skip them.
    			if (hasActiveRoute) {
    				return;
    			}

    			const matchingRoute = match(route, $location.pathname);

    			if (matchingRoute) {
    				activeRoute.set(matchingRoute);
    				hasActiveRoute = true;
    			}
    		} else {
    			routes.update(rs => {
    				rs.push(route);
    				return rs;
    			});
    		}
    	}

    	function unregisterRoute(route) {
    		routes.update(rs => {
    			const index = rs.indexOf(route);
    			rs.splice(index, 1);
    			return rs;
    		});
    	}

    	if (!locationContext) {
    		// The topmost Router in the tree is responsible for updating
    		// the location store and supplying it through context.
    		onMount(() => {
    			const unlisten = globalHistory.listen(history => {
    				location.set(history.location);
    			});

    			return unlisten;
    		});

    		setContext(LOCATION, location);
    	}

    	setContext(ROUTER, {
    		activeRoute,
    		base,
    		routerBase,
    		registerRoute,
    		unregisterRoute
    	});

    	$$self.$$set = $$props => {
    		if ('basepath' in $$props) $$invalidate(3, basepath = $$props.basepath);
    		if ('url' in $$props) $$invalidate(4, url = $$props.url);
    		if ('$$scope' in $$props) $$invalidate(8, $$scope = $$props.$$scope);
    	};

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*$base*/ 128) {
    			// This reactive statement will update all the Routes' path when
    			// the basepath changes.
    			{
    				const { path: basepath } = $base;

    				routes.update(rs => {
    					rs.forEach(r => r.path = combinePaths(basepath, r._path));
    					return rs;
    				});
    			}
    		}

    		if ($$self.$$.dirty & /*$routes, $location*/ 96) {
    			// This reactive statement will be run when the Router is created
    			// when there are no Routes and then again the following tick, so it
    			// will not find an active Route in SSR and in the browser it will only
    			// pick an active Route after all Routes have been registered.
    			{
    				const bestMatch = pick$1($routes, $location.pathname);
    				activeRoute.set(bestMatch);
    			}
    		}
    	};

    	return [
    		routes,
    		location,
    		base,
    		basepath,
    		url,
    		$location,
    		$routes,
    		$base,
    		$$scope,
    		slots
    	];
    }

    class Router extends SvelteComponent {
    	constructor(options) {
    		super();
    		init(this, options, instance$B, create_fragment$B, safe_not_equal, { basepath: 3, url: 4 });
    	}
    }

    /* node_modules\svelte-routing\src\Route.svelte generated by Svelte v3.49.0 */

    const get_default_slot_changes$1 = dirty => ({
    	params: dirty & /*routeParams*/ 4,
    	location: dirty & /*$location*/ 16
    });

    const get_default_slot_context$1 = ctx => ({
    	params: /*routeParams*/ ctx[2],
    	location: /*$location*/ ctx[4]
    });

    // (40:0) {#if $activeRoute !== null && $activeRoute.route === route}
    function create_if_block$l(ctx) {
    	let current_block_type_index;
    	let if_block;
    	let if_block_anchor;
    	let current;
    	const if_block_creators = [create_if_block_1$9, create_else_block$c];
    	const if_blocks = [];

    	function select_block_type(ctx, dirty) {
    		if (/*component*/ ctx[0] !== null) return 0;
    		return 1;
    	}

    	current_block_type_index = select_block_type(ctx);
    	if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);

    	return {
    		c() {
    			if_block.c();
    			if_block_anchor = empty$1();
    		},
    		m(target, anchor) {
    			if_blocks[current_block_type_index].m(target, anchor);
    			insert(target, if_block_anchor, anchor);
    			current = true;
    		},
    		p(ctx, dirty) {
    			let previous_block_index = current_block_type_index;
    			current_block_type_index = select_block_type(ctx);

    			if (current_block_type_index === previous_block_index) {
    				if_blocks[current_block_type_index].p(ctx, dirty);
    			} else {
    				group_outros();

    				transition_out(if_blocks[previous_block_index], 1, 1, () => {
    					if_blocks[previous_block_index] = null;
    				});

    				check_outros();
    				if_block = if_blocks[current_block_type_index];

    				if (!if_block) {
    					if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    					if_block.c();
    				} else {
    					if_block.p(ctx, dirty);
    				}

    				transition_in(if_block, 1);
    				if_block.m(if_block_anchor.parentNode, if_block_anchor);
    			}
    		},
    		i(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d(detaching) {
    			if_blocks[current_block_type_index].d(detaching);
    			if (detaching) detach(if_block_anchor);
    		}
    	};
    }

    // (43:2) {:else}
    function create_else_block$c(ctx) {
    	let current;
    	const default_slot_template = /*#slots*/ ctx[10].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[9], get_default_slot_context$1);

    	return {
    		c() {
    			if (default_slot) default_slot.c();
    		},
    		m(target, anchor) {
    			if (default_slot) {
    				default_slot.m(target, anchor);
    			}

    			current = true;
    		},
    		p(ctx, dirty) {
    			if (default_slot) {
    				if (default_slot.p && (!current || dirty & /*$$scope, routeParams, $location*/ 532)) {
    					update_slot_base(
    						default_slot,
    						default_slot_template,
    						ctx,
    						/*$$scope*/ ctx[9],
    						!current
    						? get_all_dirty_from_scope(/*$$scope*/ ctx[9])
    						: get_slot_changes(default_slot_template, /*$$scope*/ ctx[9], dirty, get_default_slot_changes$1),
    						get_default_slot_context$1
    					);
    				}
    			}
    		},
    		i(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d(detaching) {
    			if (default_slot) default_slot.d(detaching);
    		}
    	};
    }

    // (41:2) {#if component !== null}
    function create_if_block_1$9(ctx) {
    	let switch_instance;
    	let switch_instance_anchor;
    	let current;
    	const switch_instance_spread_levels = [/*routeParams*/ ctx[2], /*routeProps*/ ctx[3]];
    	var switch_value = /*component*/ ctx[0];

    	function switch_props(ctx) {
    		let switch_instance_props = {};

    		for (let i = 0; i < switch_instance_spread_levels.length; i += 1) {
    			switch_instance_props = assign(switch_instance_props, switch_instance_spread_levels[i]);
    		}

    		return { props: switch_instance_props };
    	}

    	if (switch_value) {
    		switch_instance = new switch_value(switch_props());
    	}

    	return {
    		c() {
    			if (switch_instance) create_component(switch_instance.$$.fragment);
    			switch_instance_anchor = empty$1();
    		},
    		m(target, anchor) {
    			if (switch_instance) {
    				mount_component(switch_instance, target, anchor);
    			}

    			insert(target, switch_instance_anchor, anchor);
    			current = true;
    		},
    		p(ctx, dirty) {
    			const switch_instance_changes = (dirty & /*routeParams, routeProps*/ 12)
    			? get_spread_update(switch_instance_spread_levels, [
    					dirty & /*routeParams*/ 4 && get_spread_object(/*routeParams*/ ctx[2]),
    					dirty & /*routeProps*/ 8 && get_spread_object(/*routeProps*/ ctx[3])
    				])
    			: {};

    			if (switch_value !== (switch_value = /*component*/ ctx[0])) {
    				if (switch_instance) {
    					group_outros();
    					const old_component = switch_instance;

    					transition_out(old_component.$$.fragment, 1, 0, () => {
    						destroy_component(old_component, 1);
    					});

    					check_outros();
    				}

    				if (switch_value) {
    					switch_instance = new switch_value(switch_props());
    					create_component(switch_instance.$$.fragment);
    					transition_in(switch_instance.$$.fragment, 1);
    					mount_component(switch_instance, switch_instance_anchor.parentNode, switch_instance_anchor);
    				} else {
    					switch_instance = null;
    				}
    			} else if (switch_value) {
    				switch_instance.$set(switch_instance_changes);
    			}
    		},
    		i(local) {
    			if (current) return;
    			if (switch_instance) transition_in(switch_instance.$$.fragment, local);
    			current = true;
    		},
    		o(local) {
    			if (switch_instance) transition_out(switch_instance.$$.fragment, local);
    			current = false;
    		},
    		d(detaching) {
    			if (detaching) detach(switch_instance_anchor);
    			if (switch_instance) destroy_component(switch_instance, detaching);
    		}
    	};
    }

    function create_fragment$A(ctx) {
    	let if_block_anchor;
    	let current;
    	let if_block = /*$activeRoute*/ ctx[1] !== null && /*$activeRoute*/ ctx[1].route === /*route*/ ctx[7] && create_if_block$l(ctx);

    	return {
    		c() {
    			if (if_block) if_block.c();
    			if_block_anchor = empty$1();
    		},
    		m(target, anchor) {
    			if (if_block) if_block.m(target, anchor);
    			insert(target, if_block_anchor, anchor);
    			current = true;
    		},
    		p(ctx, [dirty]) {
    			if (/*$activeRoute*/ ctx[1] !== null && /*$activeRoute*/ ctx[1].route === /*route*/ ctx[7]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);

    					if (dirty & /*$activeRoute*/ 2) {
    						transition_in(if_block, 1);
    					}
    				} else {
    					if_block = create_if_block$l(ctx);
    					if_block.c();
    					transition_in(if_block, 1);
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			} else if (if_block) {
    				group_outros();

    				transition_out(if_block, 1, 1, () => {
    					if_block = null;
    				});

    				check_outros();
    			}
    		},
    		i(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d(detaching) {
    			if (if_block) if_block.d(detaching);
    			if (detaching) detach(if_block_anchor);
    		}
    	};
    }

    function instance$A($$self, $$props, $$invalidate) {
    	let $activeRoute;
    	let $location;
    	let { $$slots: slots = {}, $$scope } = $$props;
    	let { path = "" } = $$props;
    	let { component = null } = $$props;
    	const { registerRoute, unregisterRoute, activeRoute } = getContext(ROUTER);
    	component_subscribe($$self, activeRoute, value => $$invalidate(1, $activeRoute = value));
    	const location = getContext(LOCATION);
    	component_subscribe($$self, location, value => $$invalidate(4, $location = value));

    	const route = {
    		path,
    		// If no path prop is given, this Route will act as the default Route
    		// that is rendered if no other Route in the Router is a match.
    		default: path === ""
    	};

    	let routeParams = {};
    	let routeProps = {};
    	registerRoute(route);

    	// There is no need to unregister Routes in SSR since it will all be
    	// thrown away anyway.
    	if (typeof window !== "undefined") {
    		onDestroy(() => {
    			unregisterRoute(route);
    		});
    	}

    	$$self.$$set = $$new_props => {
    		$$invalidate(13, $$props = assign(assign({}, $$props), exclude_internal_props($$new_props)));
    		if ('path' in $$new_props) $$invalidate(8, path = $$new_props.path);
    		if ('component' in $$new_props) $$invalidate(0, component = $$new_props.component);
    		if ('$$scope' in $$new_props) $$invalidate(9, $$scope = $$new_props.$$scope);
    	};

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*$activeRoute*/ 2) {
    			if ($activeRoute && $activeRoute.route === route) {
    				$$invalidate(2, routeParams = $activeRoute.params);
    			}
    		}

    		{
    			const { path, component, ...rest } = $$props;
    			$$invalidate(3, routeProps = rest);
    		}
    	};

    	$$props = exclude_internal_props($$props);

    	return [
    		component,
    		$activeRoute,
    		routeParams,
    		routeProps,
    		$location,
    		activeRoute,
    		location,
    		route,
    		path,
    		$$scope,
    		slots
    	];
    }

    class Route extends SvelteComponent {
    	constructor(options) {
    		super();
    		init(this, options, instance$A, create_fragment$A, safe_not_equal, { path: 8, component: 0 });
    	}
    }

    /* node_modules\svelte-routing\src\Link.svelte generated by Svelte v3.49.0 */

    function create_fragment$z(ctx) {
    	let a;
    	let current;
    	let mounted;
    	let dispose;
    	const default_slot_template = /*#slots*/ ctx[15].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[14], null);

    	let a_levels = [
    		{ href: /*href*/ ctx[0] },
    		{ "aria-current": /*ariaCurrent*/ ctx[2] },
    		/*props*/ ctx[1]
    	];

    	let a_data = {};

    	for (let i = 0; i < a_levels.length; i += 1) {
    		a_data = assign(a_data, a_levels[i]);
    	}

    	return {
    		c() {
    			a = element("a");
    			if (default_slot) default_slot.c();
    			set_attributes(a, a_data);
    		},
    		m(target, anchor) {
    			insert(target, a, anchor);

    			if (default_slot) {
    				default_slot.m(a, null);
    			}

    			current = true;

    			if (!mounted) {
    				dispose = listen(a, "click", /*onClick*/ ctx[5]);
    				mounted = true;
    			}
    		},
    		p(ctx, [dirty]) {
    			if (default_slot) {
    				if (default_slot.p && (!current || dirty & /*$$scope*/ 16384)) {
    					update_slot_base(
    						default_slot,
    						default_slot_template,
    						ctx,
    						/*$$scope*/ ctx[14],
    						!current
    						? get_all_dirty_from_scope(/*$$scope*/ ctx[14])
    						: get_slot_changes(default_slot_template, /*$$scope*/ ctx[14], dirty, null),
    						null
    					);
    				}
    			}

    			set_attributes(a, a_data = get_spread_update(a_levels, [
    				(!current || dirty & /*href*/ 1) && { href: /*href*/ ctx[0] },
    				(!current || dirty & /*ariaCurrent*/ 4) && { "aria-current": /*ariaCurrent*/ ctx[2] },
    				dirty & /*props*/ 2 && /*props*/ ctx[1]
    			]));
    		},
    		i(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d(detaching) {
    			if (detaching) detach(a);
    			if (default_slot) default_slot.d(detaching);
    			mounted = false;
    			dispose();
    		}
    	};
    }

    function instance$z($$self, $$props, $$invalidate) {
    	let ariaCurrent;
    	let $location;
    	let $base;
    	let { $$slots: slots = {}, $$scope } = $$props;
    	let { to = "#" } = $$props;
    	let { replace = false } = $$props;
    	let { state = {} } = $$props;
    	let { getProps = () => ({}) } = $$props;
    	const { base } = getContext(ROUTER);
    	component_subscribe($$self, base, value => $$invalidate(13, $base = value));
    	const location = getContext(LOCATION);
    	component_subscribe($$self, location, value => $$invalidate(12, $location = value));
    	const dispatch = createEventDispatcher();
    	let href, isPartiallyCurrent, isCurrent, props;

    	function onClick(event) {
    		dispatch("click", event);

    		if (shouldNavigate(event)) {
    			event.preventDefault();

    			// Don't push another entry to the history stack when the user
    			// clicks on a Link to the page they are currently on.
    			const shouldReplace = $location.pathname === href || replace;

    			navigate(href, { state, replace: shouldReplace });
    		}
    	}

    	$$self.$$set = $$props => {
    		if ('to' in $$props) $$invalidate(6, to = $$props.to);
    		if ('replace' in $$props) $$invalidate(7, replace = $$props.replace);
    		if ('state' in $$props) $$invalidate(8, state = $$props.state);
    		if ('getProps' in $$props) $$invalidate(9, getProps = $$props.getProps);
    		if ('$$scope' in $$props) $$invalidate(14, $$scope = $$props.$$scope);
    	};

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*to, $base*/ 8256) {
    			$$invalidate(0, href = to === "/" ? $base.uri : resolve(to, $base.uri));
    		}

    		if ($$self.$$.dirty & /*$location, href*/ 4097) {
    			$$invalidate(10, isPartiallyCurrent = startsWith($location.pathname, href));
    		}

    		if ($$self.$$.dirty & /*href, $location*/ 4097) {
    			$$invalidate(11, isCurrent = href === $location.pathname);
    		}

    		if ($$self.$$.dirty & /*isCurrent*/ 2048) {
    			$$invalidate(2, ariaCurrent = isCurrent ? "page" : undefined);
    		}

    		if ($$self.$$.dirty & /*getProps, $location, href, isPartiallyCurrent, isCurrent*/ 7681) {
    			$$invalidate(1, props = getProps({
    				location: $location,
    				href,
    				isPartiallyCurrent,
    				isCurrent
    			}));
    		}
    	};

    	return [
    		href,
    		props,
    		ariaCurrent,
    		base,
    		location,
    		onClick,
    		to,
    		replace,
    		state,
    		getProps,
    		isPartiallyCurrent,
    		isCurrent,
    		$location,
    		$base,
    		$$scope,
    		slots
    	];
    }

    class Link extends SvelteComponent {
    	constructor(options) {
    		super();
    		init(this, options, instance$z, create_fragment$z, safe_not_equal, { to: 6, replace: 7, state: 8, getProps: 9 });
    	}
    }

    function getDefaultExportFromCjs (x) {
    	return x && x.__esModule && Object.prototype.hasOwnProperty.call(x, 'default') ? x['default'] : x;
    }

    var axios$3 = {exports: {}};

    var axios$2 = {exports: {}};

    var bind$2 = function bind(fn, thisArg) {
      return function wrap() {
        var args = new Array(arguments.length);
        for (var i = 0; i < args.length; i++) {
          args[i] = arguments[i];
        }
        return fn.apply(thisArg, args);
      };
    };

    var bind$1 = bind$2;

    // utils is a library of generic helper functions non-specific to axios

    var toString$1 = Object.prototype.toString;

    // eslint-disable-next-line func-names
    var kindOf = (function(cache) {
      // eslint-disable-next-line func-names
      return function(thing) {
        var str = toString$1.call(thing);
        return cache[str] || (cache[str] = str.slice(8, -1).toLowerCase());
      };
    })(Object.create(null));

    function kindOfTest(type) {
      type = type.toLowerCase();
      return function isKindOf(thing) {
        return kindOf(thing) === type;
      };
    }

    /**
     * Determine if a value is an Array
     *
     * @param {Object} val The value to test
     * @returns {boolean} True if value is an Array, otherwise false
     */
    function isArray(val) {
      return Array.isArray(val);
    }

    /**
     * Determine if a value is undefined
     *
     * @param {Object} val The value to test
     * @returns {boolean} True if the value is undefined, otherwise false
     */
    function isUndefined(val) {
      return typeof val === 'undefined';
    }

    /**
     * Determine if a value is a Buffer
     *
     * @param {Object} val The value to test
     * @returns {boolean} True if value is a Buffer, otherwise false
     */
    function isBuffer(val) {
      return val !== null && !isUndefined(val) && val.constructor !== null && !isUndefined(val.constructor)
        && typeof val.constructor.isBuffer === 'function' && val.constructor.isBuffer(val);
    }

    /**
     * Determine if a value is an ArrayBuffer
     *
     * @function
     * @param {Object} val The value to test
     * @returns {boolean} True if value is an ArrayBuffer, otherwise false
     */
    var isArrayBuffer = kindOfTest('ArrayBuffer');


    /**
     * Determine if a value is a view on an ArrayBuffer
     *
     * @param {Object} val The value to test
     * @returns {boolean} True if value is a view on an ArrayBuffer, otherwise false
     */
    function isArrayBufferView(val) {
      var result;
      if ((typeof ArrayBuffer !== 'undefined') && (ArrayBuffer.isView)) {
        result = ArrayBuffer.isView(val);
      } else {
        result = (val) && (val.buffer) && (isArrayBuffer(val.buffer));
      }
      return result;
    }

    /**
     * Determine if a value is a String
     *
     * @param {Object} val The value to test
     * @returns {boolean} True if value is a String, otherwise false
     */
    function isString(val) {
      return typeof val === 'string';
    }

    /**
     * Determine if a value is a Number
     *
     * @param {Object} val The value to test
     * @returns {boolean} True if value is a Number, otherwise false
     */
    function isNumber(val) {
      return typeof val === 'number';
    }

    /**
     * Determine if a value is an Object
     *
     * @param {Object} val The value to test
     * @returns {boolean} True if value is an Object, otherwise false
     */
    function isObject(val) {
      return val !== null && typeof val === 'object';
    }

    /**
     * Determine if a value is a plain Object
     *
     * @param {Object} val The value to test
     * @return {boolean} True if value is a plain Object, otherwise false
     */
    function isPlainObject(val) {
      if (kindOf(val) !== 'object') {
        return false;
      }

      var prototype = Object.getPrototypeOf(val);
      return prototype === null || prototype === Object.prototype;
    }

    /**
     * Determine if a value is a Date
     *
     * @function
     * @param {Object} val The value to test
     * @returns {boolean} True if value is a Date, otherwise false
     */
    var isDate = kindOfTest('Date');

    /**
     * Determine if a value is a File
     *
     * @function
     * @param {Object} val The value to test
     * @returns {boolean} True if value is a File, otherwise false
     */
    var isFile = kindOfTest('File');

    /**
     * Determine if a value is a Blob
     *
     * @function
     * @param {Object} val The value to test
     * @returns {boolean} True if value is a Blob, otherwise false
     */
    var isBlob = kindOfTest('Blob');

    /**
     * Determine if a value is a FileList
     *
     * @function
     * @param {Object} val The value to test
     * @returns {boolean} True if value is a File, otherwise false
     */
    var isFileList = kindOfTest('FileList');

    /**
     * Determine if a value is a Function
     *
     * @param {Object} val The value to test
     * @returns {boolean} True if value is a Function, otherwise false
     */
    function isFunction(val) {
      return toString$1.call(val) === '[object Function]';
    }

    /**
     * Determine if a value is a Stream
     *
     * @param {Object} val The value to test
     * @returns {boolean} True if value is a Stream, otherwise false
     */
    function isStream(val) {
      return isObject(val) && isFunction(val.pipe);
    }

    /**
     * Determine if a value is a FormData
     *
     * @param {Object} thing The value to test
     * @returns {boolean} True if value is an FormData, otherwise false
     */
    function isFormData(thing) {
      var pattern = '[object FormData]';
      return thing && (
        (typeof FormData === 'function' && thing instanceof FormData) ||
        toString$1.call(thing) === pattern ||
        (isFunction(thing.toString) && thing.toString() === pattern)
      );
    }

    /**
     * Determine if a value is a URLSearchParams object
     * @function
     * @param {Object} val The value to test
     * @returns {boolean} True if value is a URLSearchParams object, otherwise false
     */
    var isURLSearchParams = kindOfTest('URLSearchParams');

    /**
     * Trim excess whitespace off the beginning and end of a string
     *
     * @param {String} str The String to trim
     * @returns {String} The String freed of excess whitespace
     */
    function trim(str) {
      return str.trim ? str.trim() : str.replace(/^\s+|\s+$/g, '');
    }

    /**
     * Determine if we're running in a standard browser environment
     *
     * This allows axios to run in a web worker, and react-native.
     * Both environments support XMLHttpRequest, but not fully standard globals.
     *
     * web workers:
     *  typeof window -> undefined
     *  typeof document -> undefined
     *
     * react-native:
     *  navigator.product -> 'ReactNative'
     * nativescript
     *  navigator.product -> 'NativeScript' or 'NS'
     */
    function isStandardBrowserEnv() {
      if (typeof navigator !== 'undefined' && (navigator.product === 'ReactNative' ||
                                               navigator.product === 'NativeScript' ||
                                               navigator.product === 'NS')) {
        return false;
      }
      return (
        typeof window !== 'undefined' &&
        typeof document !== 'undefined'
      );
    }

    /**
     * Iterate over an Array or an Object invoking a function for each item.
     *
     * If `obj` is an Array callback will be called passing
     * the value, index, and complete array for each item.
     *
     * If 'obj' is an Object callback will be called passing
     * the value, key, and complete object for each property.
     *
     * @param {Object|Array} obj The object to iterate
     * @param {Function} fn The callback to invoke for each item
     */
    function forEach(obj, fn) {
      // Don't bother if no value provided
      if (obj === null || typeof obj === 'undefined') {
        return;
      }

      // Force an array if not already something iterable
      if (typeof obj !== 'object') {
        /*eslint no-param-reassign:0*/
        obj = [obj];
      }

      if (isArray(obj)) {
        // Iterate over array values
        for (var i = 0, l = obj.length; i < l; i++) {
          fn.call(null, obj[i], i, obj);
        }
      } else {
        // Iterate over object keys
        for (var key in obj) {
          if (Object.prototype.hasOwnProperty.call(obj, key)) {
            fn.call(null, obj[key], key, obj);
          }
        }
      }
    }

    /**
     * Accepts varargs expecting each argument to be an object, then
     * immutably merges the properties of each object and returns result.
     *
     * When multiple objects contain the same key the later object in
     * the arguments list will take precedence.
     *
     * Example:
     *
     * ```js
     * var result = merge({foo: 123}, {foo: 456});
     * console.log(result.foo); // outputs 456
     * ```
     *
     * @param {Object} obj1 Object to merge
     * @returns {Object} Result of all merge properties
     */
    function merge(/* obj1, obj2, obj3, ... */) {
      var result = {};
      function assignValue(val, key) {
        if (isPlainObject(result[key]) && isPlainObject(val)) {
          result[key] = merge(result[key], val);
        } else if (isPlainObject(val)) {
          result[key] = merge({}, val);
        } else if (isArray(val)) {
          result[key] = val.slice();
        } else {
          result[key] = val;
        }
      }

      for (var i = 0, l = arguments.length; i < l; i++) {
        forEach(arguments[i], assignValue);
      }
      return result;
    }

    /**
     * Extends object a by mutably adding to it the properties of object b.
     *
     * @param {Object} a The object to be extended
     * @param {Object} b The object to copy properties from
     * @param {Object} thisArg The object to bind function to
     * @return {Object} The resulting value of object a
     */
    function extend(a, b, thisArg) {
      forEach(b, function assignValue(val, key) {
        if (thisArg && typeof val === 'function') {
          a[key] = bind$1(val, thisArg);
        } else {
          a[key] = val;
        }
      });
      return a;
    }

    /**
     * Remove byte order marker. This catches EF BB BF (the UTF-8 BOM)
     *
     * @param {string} content with BOM
     * @return {string} content value without BOM
     */
    function stripBOM(content) {
      if (content.charCodeAt(0) === 0xFEFF) {
        content = content.slice(1);
      }
      return content;
    }

    /**
     * Inherit the prototype methods from one constructor into another
     * @param {function} constructor
     * @param {function} superConstructor
     * @param {object} [props]
     * @param {object} [descriptors]
     */

    function inherits(constructor, superConstructor, props, descriptors) {
      constructor.prototype = Object.create(superConstructor.prototype, descriptors);
      constructor.prototype.constructor = constructor;
      props && Object.assign(constructor.prototype, props);
    }

    /**
     * Resolve object with deep prototype chain to a flat object
     * @param {Object} sourceObj source object
     * @param {Object} [destObj]
     * @param {Function} [filter]
     * @returns {Object}
     */

    function toFlatObject(sourceObj, destObj, filter) {
      var props;
      var i;
      var prop;
      var merged = {};

      destObj = destObj || {};

      do {
        props = Object.getOwnPropertyNames(sourceObj);
        i = props.length;
        while (i-- > 0) {
          prop = props[i];
          if (!merged[prop]) {
            destObj[prop] = sourceObj[prop];
            merged[prop] = true;
          }
        }
        sourceObj = Object.getPrototypeOf(sourceObj);
      } while (sourceObj && (!filter || filter(sourceObj, destObj)) && sourceObj !== Object.prototype);

      return destObj;
    }

    /*
     * determines whether a string ends with the characters of a specified string
     * @param {String} str
     * @param {String} searchString
     * @param {Number} [position= 0]
     * @returns {boolean}
     */
    function endsWith(str, searchString, position) {
      str = String(str);
      if (position === undefined || position > str.length) {
        position = str.length;
      }
      position -= searchString.length;
      var lastIndex = str.indexOf(searchString, position);
      return lastIndex !== -1 && lastIndex === position;
    }


    /**
     * Returns new array from array like object
     * @param {*} [thing]
     * @returns {Array}
     */
    function toArray(thing) {
      if (!thing) return null;
      var i = thing.length;
      if (isUndefined(i)) return null;
      var arr = new Array(i);
      while (i-- > 0) {
        arr[i] = thing[i];
      }
      return arr;
    }

    // eslint-disable-next-line func-names
    var isTypedArray = (function(TypedArray) {
      // eslint-disable-next-line func-names
      return function(thing) {
        return TypedArray && thing instanceof TypedArray;
      };
    })(typeof Uint8Array !== 'undefined' && Object.getPrototypeOf(Uint8Array));

    var utils$9 = {
      isArray: isArray,
      isArrayBuffer: isArrayBuffer,
      isBuffer: isBuffer,
      isFormData: isFormData,
      isArrayBufferView: isArrayBufferView,
      isString: isString,
      isNumber: isNumber,
      isObject: isObject,
      isPlainObject: isPlainObject,
      isUndefined: isUndefined,
      isDate: isDate,
      isFile: isFile,
      isBlob: isBlob,
      isFunction: isFunction,
      isStream: isStream,
      isURLSearchParams: isURLSearchParams,
      isStandardBrowserEnv: isStandardBrowserEnv,
      forEach: forEach,
      merge: merge,
      extend: extend,
      trim: trim,
      stripBOM: stripBOM,
      inherits: inherits,
      toFlatObject: toFlatObject,
      kindOf: kindOf,
      kindOfTest: kindOfTest,
      endsWith: endsWith,
      toArray: toArray,
      isTypedArray: isTypedArray,
      isFileList: isFileList
    };

    var utils$8 = utils$9;

    function encode$2(val) {
      return encodeURIComponent(val).
        replace(/%3A/gi, ':').
        replace(/%24/g, '$').
        replace(/%2C/gi, ',').
        replace(/%20/g, '+').
        replace(/%5B/gi, '[').
        replace(/%5D/gi, ']');
    }

    /**
     * Build a URL by appending params to the end
     *
     * @param {string} url The base of the url (e.g., http://www.google.com)
     * @param {object} [params] The params to be appended
     * @returns {string} The formatted url
     */
    var buildURL$1 = function buildURL(url, params, paramsSerializer) {
      /*eslint no-param-reassign:0*/
      if (!params) {
        return url;
      }

      var serializedParams;
      if (paramsSerializer) {
        serializedParams = paramsSerializer(params);
      } else if (utils$8.isURLSearchParams(params)) {
        serializedParams = params.toString();
      } else {
        var parts = [];

        utils$8.forEach(params, function serialize(val, key) {
          if (val === null || typeof val === 'undefined') {
            return;
          }

          if (utils$8.isArray(val)) {
            key = key + '[]';
          } else {
            val = [val];
          }

          utils$8.forEach(val, function parseValue(v) {
            if (utils$8.isDate(v)) {
              v = v.toISOString();
            } else if (utils$8.isObject(v)) {
              v = JSON.stringify(v);
            }
            parts.push(encode$2(key) + '=' + encode$2(v));
          });
        });

        serializedParams = parts.join('&');
      }

      if (serializedParams) {
        var hashmarkIndex = url.indexOf('#');
        if (hashmarkIndex !== -1) {
          url = url.slice(0, hashmarkIndex);
        }

        url += (url.indexOf('?') === -1 ? '?' : '&') + serializedParams;
      }

      return url;
    };

    var utils$7 = utils$9;

    function InterceptorManager$1() {
      this.handlers = [];
    }

    /**
     * Add a new interceptor to the stack
     *
     * @param {Function} fulfilled The function to handle `then` for a `Promise`
     * @param {Function} rejected The function to handle `reject` for a `Promise`
     *
     * @return {Number} An ID used to remove interceptor later
     */
    InterceptorManager$1.prototype.use = function use(fulfilled, rejected, options) {
      this.handlers.push({
        fulfilled: fulfilled,
        rejected: rejected,
        synchronous: options ? options.synchronous : false,
        runWhen: options ? options.runWhen : null
      });
      return this.handlers.length - 1;
    };

    /**
     * Remove an interceptor from the stack
     *
     * @param {Number} id The ID that was returned by `use`
     */
    InterceptorManager$1.prototype.eject = function eject(id) {
      if (this.handlers[id]) {
        this.handlers[id] = null;
      }
    };

    /**
     * Iterate over all the registered interceptors
     *
     * This method is particularly useful for skipping over any
     * interceptors that may have become `null` calling `eject`.
     *
     * @param {Function} fn The function to call for each interceptor
     */
    InterceptorManager$1.prototype.forEach = function forEach(fn) {
      utils$7.forEach(this.handlers, function forEachHandler(h) {
        if (h !== null) {
          fn(h);
        }
      });
    };

    var InterceptorManager_1 = InterceptorManager$1;

    var utils$6 = utils$9;

    var normalizeHeaderName$1 = function normalizeHeaderName(headers, normalizedName) {
      utils$6.forEach(headers, function processHeader(value, name) {
        if (name !== normalizedName && name.toUpperCase() === normalizedName.toUpperCase()) {
          headers[normalizedName] = value;
          delete headers[name];
        }
      });
    };

    var AxiosError_1;
    var hasRequiredAxiosError;

    function requireAxiosError () {
    	if (hasRequiredAxiosError) return AxiosError_1;
    	hasRequiredAxiosError = 1;

    	var utils = utils$9;

    	/**
    	 * Create an Error with the specified message, config, error code, request and response.
    	 *
    	 * @param {string} message The error message.
    	 * @param {string} [code] The error code (for example, 'ECONNABORTED').
    	 * @param {Object} [config] The config.
    	 * @param {Object} [request] The request.
    	 * @param {Object} [response] The response.
    	 * @returns {Error} The created error.
    	 */
    	function AxiosError(message, code, config, request, response) {
    	  Error.call(this);
    	  this.message = message;
    	  this.name = 'AxiosError';
    	  code && (this.code = code);
    	  config && (this.config = config);
    	  request && (this.request = request);
    	  response && (this.response = response);
    	}

    	utils.inherits(AxiosError, Error, {
    	  toJSON: function toJSON() {
    	    return {
    	      // Standard
    	      message: this.message,
    	      name: this.name,
    	      // Microsoft
    	      description: this.description,
    	      number: this.number,
    	      // Mozilla
    	      fileName: this.fileName,
    	      lineNumber: this.lineNumber,
    	      columnNumber: this.columnNumber,
    	      stack: this.stack,
    	      // Axios
    	      config: this.config,
    	      code: this.code,
    	      status: this.response && this.response.status ? this.response.status : null
    	    };
    	  }
    	});

    	var prototype = AxiosError.prototype;
    	var descriptors = {};

    	[
    	  'ERR_BAD_OPTION_VALUE',
    	  'ERR_BAD_OPTION',
    	  'ECONNABORTED',
    	  'ETIMEDOUT',
    	  'ERR_NETWORK',
    	  'ERR_FR_TOO_MANY_REDIRECTS',
    	  'ERR_DEPRECATED',
    	  'ERR_BAD_RESPONSE',
    	  'ERR_BAD_REQUEST',
    	  'ERR_CANCELED'
    	// eslint-disable-next-line func-names
    	].forEach(function(code) {
    	  descriptors[code] = {value: code};
    	});

    	Object.defineProperties(AxiosError, descriptors);
    	Object.defineProperty(prototype, 'isAxiosError', {value: true});

    	// eslint-disable-next-line func-names
    	AxiosError.from = function(error, code, config, request, response, customProps) {
    	  var axiosError = Object.create(prototype);

    	  utils.toFlatObject(error, axiosError, function filter(obj) {
    	    return obj !== Error.prototype;
    	  });

    	  AxiosError.call(axiosError, error.message, code, config, request, response);

    	  axiosError.name = error.name;

    	  customProps && Object.assign(axiosError, customProps);

    	  return axiosError;
    	};

    	AxiosError_1 = AxiosError;
    	return AxiosError_1;
    }

    var transitional = {
      silentJSONParsing: true,
      forcedJSONParsing: true,
      clarifyTimeoutError: false
    };

    var toFormData_1;
    var hasRequiredToFormData;

    function requireToFormData () {
    	if (hasRequiredToFormData) return toFormData_1;
    	hasRequiredToFormData = 1;

    	var utils = utils$9;

    	/**
    	 * Convert a data object to FormData
    	 * @param {Object} obj
    	 * @param {?Object} [formData]
    	 * @returns {Object}
    	 **/

    	function toFormData(obj, formData) {
    	  // eslint-disable-next-line no-param-reassign
    	  formData = formData || new FormData();

    	  var stack = [];

    	  function convertValue(value) {
    	    if (value === null) return '';

    	    if (utils.isDate(value)) {
    	      return value.toISOString();
    	    }

    	    if (utils.isArrayBuffer(value) || utils.isTypedArray(value)) {
    	      return typeof Blob === 'function' ? new Blob([value]) : Buffer.from(value);
    	    }

    	    return value;
    	  }

    	  function build(data, parentKey) {
    	    if (utils.isPlainObject(data) || utils.isArray(data)) {
    	      if (stack.indexOf(data) !== -1) {
    	        throw Error('Circular reference detected in ' + parentKey);
    	      }

    	      stack.push(data);

    	      utils.forEach(data, function each(value, key) {
    	        if (utils.isUndefined(value)) return;
    	        var fullKey = parentKey ? parentKey + '.' + key : key;
    	        var arr;

    	        if (value && !parentKey && typeof value === 'object') {
    	          if (utils.endsWith(key, '{}')) {
    	            // eslint-disable-next-line no-param-reassign
    	            value = JSON.stringify(value);
    	          } else if (utils.endsWith(key, '[]') && (arr = utils.toArray(value))) {
    	            // eslint-disable-next-line func-names
    	            arr.forEach(function(el) {
    	              !utils.isUndefined(el) && formData.append(fullKey, convertValue(el));
    	            });
    	            return;
    	          }
    	        }

    	        build(value, fullKey);
    	      });

    	      stack.pop();
    	    } else {
    	      formData.append(parentKey, convertValue(data));
    	    }
    	  }

    	  build(obj);

    	  return formData;
    	}

    	toFormData_1 = toFormData;
    	return toFormData_1;
    }

    var settle;
    var hasRequiredSettle;

    function requireSettle () {
    	if (hasRequiredSettle) return settle;
    	hasRequiredSettle = 1;

    	var AxiosError = requireAxiosError();

    	/**
    	 * Resolve or reject a Promise based on response status.
    	 *
    	 * @param {Function} resolve A function that resolves the promise.
    	 * @param {Function} reject A function that rejects the promise.
    	 * @param {object} response The response.
    	 */
    	settle = function settle(resolve, reject, response) {
    	  var validateStatus = response.config.validateStatus;
    	  if (!response.status || !validateStatus || validateStatus(response.status)) {
    	    resolve(response);
    	  } else {
    	    reject(new AxiosError(
    	      'Request failed with status code ' + response.status,
    	      [AxiosError.ERR_BAD_REQUEST, AxiosError.ERR_BAD_RESPONSE][Math.floor(response.status / 100) - 4],
    	      response.config,
    	      response.request,
    	      response
    	    ));
    	  }
    	};
    	return settle;
    }

    var cookies;
    var hasRequiredCookies;

    function requireCookies () {
    	if (hasRequiredCookies) return cookies;
    	hasRequiredCookies = 1;

    	var utils = utils$9;

    	cookies = (
    	  utils.isStandardBrowserEnv() ?

    	  // Standard browser envs support document.cookie
    	    (function standardBrowserEnv() {
    	      return {
    	        write: function write(name, value, expires, path, domain, secure) {
    	          var cookie = [];
    	          cookie.push(name + '=' + encodeURIComponent(value));

    	          if (utils.isNumber(expires)) {
    	            cookie.push('expires=' + new Date(expires).toGMTString());
    	          }

    	          if (utils.isString(path)) {
    	            cookie.push('path=' + path);
    	          }

    	          if (utils.isString(domain)) {
    	            cookie.push('domain=' + domain);
    	          }

    	          if (secure === true) {
    	            cookie.push('secure');
    	          }

    	          document.cookie = cookie.join('; ');
    	        },

    	        read: function read(name) {
    	          var match = document.cookie.match(new RegExp('(^|;\\s*)(' + name + ')=([^;]*)'));
    	          return (match ? decodeURIComponent(match[3]) : null);
    	        },

    	        remove: function remove(name) {
    	          this.write(name, '', Date.now() - 86400000);
    	        }
    	      };
    	    })() :

    	  // Non standard browser env (web workers, react-native) lack needed support.
    	    (function nonStandardBrowserEnv() {
    	      return {
    	        write: function write() {},
    	        read: function read() { return null; },
    	        remove: function remove() {}
    	      };
    	    })()
    	);
    	return cookies;
    }

    /**
     * Determines whether the specified URL is absolute
     *
     * @param {string} url The URL to test
     * @returns {boolean} True if the specified URL is absolute, otherwise false
     */
    var isAbsoluteURL$1 = function isAbsoluteURL(url) {
      // A URL is considered absolute if it begins with "<scheme>://" or "//" (protocol-relative URL).
      // RFC 3986 defines scheme name as a sequence of characters beginning with a letter and followed
      // by any combination of letters, digits, plus, period, or hyphen.
      return /^([a-z][a-z\d+\-.]*:)?\/\//i.test(url);
    };

    /**
     * Creates a new URL by combining the specified URLs
     *
     * @param {string} baseURL The base URL
     * @param {string} relativeURL The relative URL
     * @returns {string} The combined URL
     */
    var combineURLs$1 = function combineURLs(baseURL, relativeURL) {
      return relativeURL
        ? baseURL.replace(/\/+$/, '') + '/' + relativeURL.replace(/^\/+/, '')
        : baseURL;
    };

    var isAbsoluteURL = isAbsoluteURL$1;
    var combineURLs = combineURLs$1;

    /**
     * Creates a new URL by combining the baseURL with the requestedURL,
     * only when the requestedURL is not already an absolute URL.
     * If the requestURL is absolute, this function returns the requestedURL untouched.
     *
     * @param {string} baseURL The base URL
     * @param {string} requestedURL Absolute or relative URL to combine
     * @returns {string} The combined full path
     */
    var buildFullPath$1 = function buildFullPath(baseURL, requestedURL) {
      if (baseURL && !isAbsoluteURL(requestedURL)) {
        return combineURLs(baseURL, requestedURL);
      }
      return requestedURL;
    };

    var parseHeaders;
    var hasRequiredParseHeaders;

    function requireParseHeaders () {
    	if (hasRequiredParseHeaders) return parseHeaders;
    	hasRequiredParseHeaders = 1;

    	var utils = utils$9;

    	// Headers whose duplicates are ignored by node
    	// c.f. https://nodejs.org/api/http.html#http_message_headers
    	var ignoreDuplicateOf = [
    	  'age', 'authorization', 'content-length', 'content-type', 'etag',
    	  'expires', 'from', 'host', 'if-modified-since', 'if-unmodified-since',
    	  'last-modified', 'location', 'max-forwards', 'proxy-authorization',
    	  'referer', 'retry-after', 'user-agent'
    	];

    	/**
    	 * Parse headers into an object
    	 *
    	 * ```
    	 * Date: Wed, 27 Aug 2014 08:58:49 GMT
    	 * Content-Type: application/json
    	 * Connection: keep-alive
    	 * Transfer-Encoding: chunked
    	 * ```
    	 *
    	 * @param {String} headers Headers needing to be parsed
    	 * @returns {Object} Headers parsed into an object
    	 */
    	parseHeaders = function parseHeaders(headers) {
    	  var parsed = {};
    	  var key;
    	  var val;
    	  var i;

    	  if (!headers) { return parsed; }

    	  utils.forEach(headers.split('\n'), function parser(line) {
    	    i = line.indexOf(':');
    	    key = utils.trim(line.substr(0, i)).toLowerCase();
    	    val = utils.trim(line.substr(i + 1));

    	    if (key) {
    	      if (parsed[key] && ignoreDuplicateOf.indexOf(key) >= 0) {
    	        return;
    	      }
    	      if (key === 'set-cookie') {
    	        parsed[key] = (parsed[key] ? parsed[key] : []).concat([val]);
    	      } else {
    	        parsed[key] = parsed[key] ? parsed[key] + ', ' + val : val;
    	      }
    	    }
    	  });

    	  return parsed;
    	};
    	return parseHeaders;
    }

    var isURLSameOrigin;
    var hasRequiredIsURLSameOrigin;

    function requireIsURLSameOrigin () {
    	if (hasRequiredIsURLSameOrigin) return isURLSameOrigin;
    	hasRequiredIsURLSameOrigin = 1;

    	var utils = utils$9;

    	isURLSameOrigin = (
    	  utils.isStandardBrowserEnv() ?

    	  // Standard browser envs have full support of the APIs needed to test
    	  // whether the request URL is of the same origin as current location.
    	    (function standardBrowserEnv() {
    	      var msie = /(msie|trident)/i.test(navigator.userAgent);
    	      var urlParsingNode = document.createElement('a');
    	      var originURL;

    	      /**
    	    * Parse a URL to discover it's components
    	    *
    	    * @param {String} url The URL to be parsed
    	    * @returns {Object}
    	    */
    	      function resolveURL(url) {
    	        var href = url;

    	        if (msie) {
    	        // IE needs attribute set twice to normalize properties
    	          urlParsingNode.setAttribute('href', href);
    	          href = urlParsingNode.href;
    	        }

    	        urlParsingNode.setAttribute('href', href);

    	        // urlParsingNode provides the UrlUtils interface - http://url.spec.whatwg.org/#urlutils
    	        return {
    	          href: urlParsingNode.href,
    	          protocol: urlParsingNode.protocol ? urlParsingNode.protocol.replace(/:$/, '') : '',
    	          host: urlParsingNode.host,
    	          search: urlParsingNode.search ? urlParsingNode.search.replace(/^\?/, '') : '',
    	          hash: urlParsingNode.hash ? urlParsingNode.hash.replace(/^#/, '') : '',
    	          hostname: urlParsingNode.hostname,
    	          port: urlParsingNode.port,
    	          pathname: (urlParsingNode.pathname.charAt(0) === '/') ?
    	            urlParsingNode.pathname :
    	            '/' + urlParsingNode.pathname
    	        };
    	      }

    	      originURL = resolveURL(window.location.href);

    	      /**
    	    * Determine if a URL shares the same origin as the current location
    	    *
    	    * @param {String} requestURL The URL to test
    	    * @returns {boolean} True if URL shares the same origin, otherwise false
    	    */
    	      return function isURLSameOrigin(requestURL) {
    	        var parsed = (utils.isString(requestURL)) ? resolveURL(requestURL) : requestURL;
    	        return (parsed.protocol === originURL.protocol &&
    	            parsed.host === originURL.host);
    	      };
    	    })() :

    	  // Non standard browser envs (web workers, react-native) lack needed support.
    	    (function nonStandardBrowserEnv() {
    	      return function isURLSameOrigin() {
    	        return true;
    	      };
    	    })()
    	);
    	return isURLSameOrigin;
    }

    var CanceledError_1;
    var hasRequiredCanceledError;

    function requireCanceledError () {
    	if (hasRequiredCanceledError) return CanceledError_1;
    	hasRequiredCanceledError = 1;

    	var AxiosError = requireAxiosError();
    	var utils = utils$9;

    	/**
    	 * A `CanceledError` is an object that is thrown when an operation is canceled.
    	 *
    	 * @class
    	 * @param {string=} message The message.
    	 */
    	function CanceledError(message) {
    	  // eslint-disable-next-line no-eq-null,eqeqeq
    	  AxiosError.call(this, message == null ? 'canceled' : message, AxiosError.ERR_CANCELED);
    	  this.name = 'CanceledError';
    	}

    	utils.inherits(CanceledError, AxiosError, {
    	  __CANCEL__: true
    	});

    	CanceledError_1 = CanceledError;
    	return CanceledError_1;
    }

    var parseProtocol;
    var hasRequiredParseProtocol;

    function requireParseProtocol () {
    	if (hasRequiredParseProtocol) return parseProtocol;
    	hasRequiredParseProtocol = 1;

    	parseProtocol = function parseProtocol(url) {
    	  var match = /^([-+\w]{1,25})(:?\/\/|:)/.exec(url);
    	  return match && match[1] || '';
    	};
    	return parseProtocol;
    }

    var xhr;
    var hasRequiredXhr;

    function requireXhr () {
    	if (hasRequiredXhr) return xhr;
    	hasRequiredXhr = 1;

    	var utils = utils$9;
    	var settle = requireSettle();
    	var cookies = requireCookies();
    	var buildURL = buildURL$1;
    	var buildFullPath = buildFullPath$1;
    	var parseHeaders = requireParseHeaders();
    	var isURLSameOrigin = requireIsURLSameOrigin();
    	var transitionalDefaults = transitional;
    	var AxiosError = requireAxiosError();
    	var CanceledError = requireCanceledError();
    	var parseProtocol = requireParseProtocol();

    	xhr = function xhrAdapter(config) {
    	  return new Promise(function dispatchXhrRequest(resolve, reject) {
    	    var requestData = config.data;
    	    var requestHeaders = config.headers;
    	    var responseType = config.responseType;
    	    var onCanceled;
    	    function done() {
    	      if (config.cancelToken) {
    	        config.cancelToken.unsubscribe(onCanceled);
    	      }

    	      if (config.signal) {
    	        config.signal.removeEventListener('abort', onCanceled);
    	      }
    	    }

    	    if (utils.isFormData(requestData) && utils.isStandardBrowserEnv()) {
    	      delete requestHeaders['Content-Type']; // Let the browser set it
    	    }

    	    var request = new XMLHttpRequest();

    	    // HTTP basic authentication
    	    if (config.auth) {
    	      var username = config.auth.username || '';
    	      var password = config.auth.password ? unescape(encodeURIComponent(config.auth.password)) : '';
    	      requestHeaders.Authorization = 'Basic ' + btoa(username + ':' + password);
    	    }

    	    var fullPath = buildFullPath(config.baseURL, config.url);

    	    request.open(config.method.toUpperCase(), buildURL(fullPath, config.params, config.paramsSerializer), true);

    	    // Set the request timeout in MS
    	    request.timeout = config.timeout;

    	    function onloadend() {
    	      if (!request) {
    	        return;
    	      }
    	      // Prepare the response
    	      var responseHeaders = 'getAllResponseHeaders' in request ? parseHeaders(request.getAllResponseHeaders()) : null;
    	      var responseData = !responseType || responseType === 'text' ||  responseType === 'json' ?
    	        request.responseText : request.response;
    	      var response = {
    	        data: responseData,
    	        status: request.status,
    	        statusText: request.statusText,
    	        headers: responseHeaders,
    	        config: config,
    	        request: request
    	      };

    	      settle(function _resolve(value) {
    	        resolve(value);
    	        done();
    	      }, function _reject(err) {
    	        reject(err);
    	        done();
    	      }, response);

    	      // Clean up request
    	      request = null;
    	    }

    	    if ('onloadend' in request) {
    	      // Use onloadend if available
    	      request.onloadend = onloadend;
    	    } else {
    	      // Listen for ready state to emulate onloadend
    	      request.onreadystatechange = function handleLoad() {
    	        if (!request || request.readyState !== 4) {
    	          return;
    	        }

    	        // The request errored out and we didn't get a response, this will be
    	        // handled by onerror instead
    	        // With one exception: request that using file: protocol, most browsers
    	        // will return status as 0 even though it's a successful request
    	        if (request.status === 0 && !(request.responseURL && request.responseURL.indexOf('file:') === 0)) {
    	          return;
    	        }
    	        // readystate handler is calling before onerror or ontimeout handlers,
    	        // so we should call onloadend on the next 'tick'
    	        setTimeout(onloadend);
    	      };
    	    }

    	    // Handle browser request cancellation (as opposed to a manual cancellation)
    	    request.onabort = function handleAbort() {
    	      if (!request) {
    	        return;
    	      }

    	      reject(new AxiosError('Request aborted', AxiosError.ECONNABORTED, config, request));

    	      // Clean up request
    	      request = null;
    	    };

    	    // Handle low level network errors
    	    request.onerror = function handleError() {
    	      // Real errors are hidden from us by the browser
    	      // onerror should only fire if it's a network error
    	      reject(new AxiosError('Network Error', AxiosError.ERR_NETWORK, config, request, request));

    	      // Clean up request
    	      request = null;
    	    };

    	    // Handle timeout
    	    request.ontimeout = function handleTimeout() {
    	      var timeoutErrorMessage = config.timeout ? 'timeout of ' + config.timeout + 'ms exceeded' : 'timeout exceeded';
    	      var transitional = config.transitional || transitionalDefaults;
    	      if (config.timeoutErrorMessage) {
    	        timeoutErrorMessage = config.timeoutErrorMessage;
    	      }
    	      reject(new AxiosError(
    	        timeoutErrorMessage,
    	        transitional.clarifyTimeoutError ? AxiosError.ETIMEDOUT : AxiosError.ECONNABORTED,
    	        config,
    	        request));

    	      // Clean up request
    	      request = null;
    	    };

    	    // Add xsrf header
    	    // This is only done if running in a standard browser environment.
    	    // Specifically not if we're in a web worker, or react-native.
    	    if (utils.isStandardBrowserEnv()) {
    	      // Add xsrf header
    	      var xsrfValue = (config.withCredentials || isURLSameOrigin(fullPath)) && config.xsrfCookieName ?
    	        cookies.read(config.xsrfCookieName) :
    	        undefined;

    	      if (xsrfValue) {
    	        requestHeaders[config.xsrfHeaderName] = xsrfValue;
    	      }
    	    }

    	    // Add headers to the request
    	    if ('setRequestHeader' in request) {
    	      utils.forEach(requestHeaders, function setRequestHeader(val, key) {
    	        if (typeof requestData === 'undefined' && key.toLowerCase() === 'content-type') {
    	          // Remove Content-Type if data is undefined
    	          delete requestHeaders[key];
    	        } else {
    	          // Otherwise add header to the request
    	          request.setRequestHeader(key, val);
    	        }
    	      });
    	    }

    	    // Add withCredentials to request if needed
    	    if (!utils.isUndefined(config.withCredentials)) {
    	      request.withCredentials = !!config.withCredentials;
    	    }

    	    // Add responseType to request if needed
    	    if (responseType && responseType !== 'json') {
    	      request.responseType = config.responseType;
    	    }

    	    // Handle progress if needed
    	    if (typeof config.onDownloadProgress === 'function') {
    	      request.addEventListener('progress', config.onDownloadProgress);
    	    }

    	    // Not all browsers support upload events
    	    if (typeof config.onUploadProgress === 'function' && request.upload) {
    	      request.upload.addEventListener('progress', config.onUploadProgress);
    	    }

    	    if (config.cancelToken || config.signal) {
    	      // Handle cancellation
    	      // eslint-disable-next-line func-names
    	      onCanceled = function(cancel) {
    	        if (!request) {
    	          return;
    	        }
    	        reject(!cancel || (cancel && cancel.type) ? new CanceledError() : cancel);
    	        request.abort();
    	        request = null;
    	      };

    	      config.cancelToken && config.cancelToken.subscribe(onCanceled);
    	      if (config.signal) {
    	        config.signal.aborted ? onCanceled() : config.signal.addEventListener('abort', onCanceled);
    	      }
    	    }

    	    if (!requestData) {
    	      requestData = null;
    	    }

    	    var protocol = parseProtocol(fullPath);

    	    if (protocol && [ 'http', 'https', 'file' ].indexOf(protocol) === -1) {
    	      reject(new AxiosError('Unsupported protocol ' + protocol + ':', AxiosError.ERR_BAD_REQUEST, config));
    	      return;
    	    }


    	    // Send the request
    	    request.send(requestData);
    	  });
    	};
    	return xhr;
    }

    var _null;
    var hasRequired_null;

    function require_null () {
    	if (hasRequired_null) return _null;
    	hasRequired_null = 1;
    	// eslint-disable-next-line strict
    	_null = null;
    	return _null;
    }

    var utils$5 = utils$9;
    var normalizeHeaderName = normalizeHeaderName$1;
    var AxiosError$1 = requireAxiosError();
    var transitionalDefaults = transitional;
    var toFormData = requireToFormData();

    var DEFAULT_CONTENT_TYPE = {
      'Content-Type': 'application/x-www-form-urlencoded'
    };

    function setContentTypeIfUnset(headers, value) {
      if (!utils$5.isUndefined(headers) && utils$5.isUndefined(headers['Content-Type'])) {
        headers['Content-Type'] = value;
      }
    }

    function getDefaultAdapter() {
      var adapter;
      if (typeof XMLHttpRequest !== 'undefined') {
        // For browsers use XHR adapter
        adapter = requireXhr();
      } else if (typeof process !== 'undefined' && Object.prototype.toString.call(process) === '[object process]') {
        // For node use HTTP adapter
        adapter = requireXhr();
      }
      return adapter;
    }

    function stringifySafely(rawValue, parser, encoder) {
      if (utils$5.isString(rawValue)) {
        try {
          (parser || JSON.parse)(rawValue);
          return utils$5.trim(rawValue);
        } catch (e) {
          if (e.name !== 'SyntaxError') {
            throw e;
          }
        }
      }

      return (encoder || JSON.stringify)(rawValue);
    }

    var defaults$3 = {

      transitional: transitionalDefaults,

      adapter: getDefaultAdapter(),

      transformRequest: [function transformRequest(data, headers) {
        normalizeHeaderName(headers, 'Accept');
        normalizeHeaderName(headers, 'Content-Type');

        if (utils$5.isFormData(data) ||
          utils$5.isArrayBuffer(data) ||
          utils$5.isBuffer(data) ||
          utils$5.isStream(data) ||
          utils$5.isFile(data) ||
          utils$5.isBlob(data)
        ) {
          return data;
        }
        if (utils$5.isArrayBufferView(data)) {
          return data.buffer;
        }
        if (utils$5.isURLSearchParams(data)) {
          setContentTypeIfUnset(headers, 'application/x-www-form-urlencoded;charset=utf-8');
          return data.toString();
        }

        var isObjectPayload = utils$5.isObject(data);
        var contentType = headers && headers['Content-Type'];

        var isFileList;

        if ((isFileList = utils$5.isFileList(data)) || (isObjectPayload && contentType === 'multipart/form-data')) {
          var _FormData = this.env && this.env.FormData;
          return toFormData(isFileList ? {'files[]': data} : data, _FormData && new _FormData());
        } else if (isObjectPayload || contentType === 'application/json') {
          setContentTypeIfUnset(headers, 'application/json');
          return stringifySafely(data);
        }

        return data;
      }],

      transformResponse: [function transformResponse(data) {
        var transitional = this.transitional || defaults$3.transitional;
        var silentJSONParsing = transitional && transitional.silentJSONParsing;
        var forcedJSONParsing = transitional && transitional.forcedJSONParsing;
        var strictJSONParsing = !silentJSONParsing && this.responseType === 'json';

        if (strictJSONParsing || (forcedJSONParsing && utils$5.isString(data) && data.length)) {
          try {
            return JSON.parse(data);
          } catch (e) {
            if (strictJSONParsing) {
              if (e.name === 'SyntaxError') {
                throw AxiosError$1.from(e, AxiosError$1.ERR_BAD_RESPONSE, this, null, this.response);
              }
              throw e;
            }
          }
        }

        return data;
      }],

      /**
       * A timeout in milliseconds to abort a request. If set to 0 (default) a
       * timeout is not created.
       */
      timeout: 0,

      xsrfCookieName: 'XSRF-TOKEN',
      xsrfHeaderName: 'X-XSRF-TOKEN',

      maxContentLength: -1,
      maxBodyLength: -1,

      env: {
        FormData: require_null()
      },

      validateStatus: function validateStatus(status) {
        return status >= 200 && status < 300;
      },

      headers: {
        common: {
          'Accept': 'application/json, text/plain, */*'
        }
      }
    };

    utils$5.forEach(['delete', 'get', 'head'], function forEachMethodNoData(method) {
      defaults$3.headers[method] = {};
    });

    utils$5.forEach(['post', 'put', 'patch'], function forEachMethodWithData(method) {
      defaults$3.headers[method] = utils$5.merge(DEFAULT_CONTENT_TYPE);
    });

    var defaults_1 = defaults$3;

    var utils$4 = utils$9;
    var defaults$2 = defaults_1;

    /**
     * Transform the data for a request or a response
     *
     * @param {Object|String} data The data to be transformed
     * @param {Array} headers The headers for the request or response
     * @param {Array|Function} fns A single function or Array of functions
     * @returns {*} The resulting transformed data
     */
    var transformData$1 = function transformData(data, headers, fns) {
      var context = this || defaults$2;
      /*eslint no-param-reassign:0*/
      utils$4.forEach(fns, function transform(fn) {
        data = fn.call(context, data, headers);
      });

      return data;
    };

    var isCancel$1;
    var hasRequiredIsCancel;

    function requireIsCancel () {
    	if (hasRequiredIsCancel) return isCancel$1;
    	hasRequiredIsCancel = 1;

    	isCancel$1 = function isCancel(value) {
    	  return !!(value && value.__CANCEL__);
    	};
    	return isCancel$1;
    }

    var utils$3 = utils$9;
    var transformData = transformData$1;
    var isCancel = requireIsCancel();
    var defaults$1 = defaults_1;
    var CanceledError = requireCanceledError();

    /**
     * Throws a `CanceledError` if cancellation has been requested.
     */
    function throwIfCancellationRequested(config) {
      if (config.cancelToken) {
        config.cancelToken.throwIfRequested();
      }

      if (config.signal && config.signal.aborted) {
        throw new CanceledError();
      }
    }

    /**
     * Dispatch a request to the server using the configured adapter.
     *
     * @param {object} config The config that is to be used for the request
     * @returns {Promise} The Promise to be fulfilled
     */
    var dispatchRequest$1 = function dispatchRequest(config) {
      throwIfCancellationRequested(config);

      // Ensure headers exist
      config.headers = config.headers || {};

      // Transform request data
      config.data = transformData.call(
        config,
        config.data,
        config.headers,
        config.transformRequest
      );

      // Flatten headers
      config.headers = utils$3.merge(
        config.headers.common || {},
        config.headers[config.method] || {},
        config.headers
      );

      utils$3.forEach(
        ['delete', 'get', 'head', 'post', 'put', 'patch', 'common'],
        function cleanHeaderConfig(method) {
          delete config.headers[method];
        }
      );

      var adapter = config.adapter || defaults$1.adapter;

      return adapter(config).then(function onAdapterResolution(response) {
        throwIfCancellationRequested(config);

        // Transform response data
        response.data = transformData.call(
          config,
          response.data,
          response.headers,
          config.transformResponse
        );

        return response;
      }, function onAdapterRejection(reason) {
        if (!isCancel(reason)) {
          throwIfCancellationRequested(config);

          // Transform response data
          if (reason && reason.response) {
            reason.response.data = transformData.call(
              config,
              reason.response.data,
              reason.response.headers,
              config.transformResponse
            );
          }
        }

        return Promise.reject(reason);
      });
    };

    var utils$2 = utils$9;

    /**
     * Config-specific merge-function which creates a new config-object
     * by merging two configuration objects together.
     *
     * @param {Object} config1
     * @param {Object} config2
     * @returns {Object} New object resulting from merging config2 to config1
     */
    var mergeConfig$2 = function mergeConfig(config1, config2) {
      // eslint-disable-next-line no-param-reassign
      config2 = config2 || {};
      var config = {};

      function getMergedValue(target, source) {
        if (utils$2.isPlainObject(target) && utils$2.isPlainObject(source)) {
          return utils$2.merge(target, source);
        } else if (utils$2.isPlainObject(source)) {
          return utils$2.merge({}, source);
        } else if (utils$2.isArray(source)) {
          return source.slice();
        }
        return source;
      }

      // eslint-disable-next-line consistent-return
      function mergeDeepProperties(prop) {
        if (!utils$2.isUndefined(config2[prop])) {
          return getMergedValue(config1[prop], config2[prop]);
        } else if (!utils$2.isUndefined(config1[prop])) {
          return getMergedValue(undefined, config1[prop]);
        }
      }

      // eslint-disable-next-line consistent-return
      function valueFromConfig2(prop) {
        if (!utils$2.isUndefined(config2[prop])) {
          return getMergedValue(undefined, config2[prop]);
        }
      }

      // eslint-disable-next-line consistent-return
      function defaultToConfig2(prop) {
        if (!utils$2.isUndefined(config2[prop])) {
          return getMergedValue(undefined, config2[prop]);
        } else if (!utils$2.isUndefined(config1[prop])) {
          return getMergedValue(undefined, config1[prop]);
        }
      }

      // eslint-disable-next-line consistent-return
      function mergeDirectKeys(prop) {
        if (prop in config2) {
          return getMergedValue(config1[prop], config2[prop]);
        } else if (prop in config1) {
          return getMergedValue(undefined, config1[prop]);
        }
      }

      var mergeMap = {
        'url': valueFromConfig2,
        'method': valueFromConfig2,
        'data': valueFromConfig2,
        'baseURL': defaultToConfig2,
        'transformRequest': defaultToConfig2,
        'transformResponse': defaultToConfig2,
        'paramsSerializer': defaultToConfig2,
        'timeout': defaultToConfig2,
        'timeoutMessage': defaultToConfig2,
        'withCredentials': defaultToConfig2,
        'adapter': defaultToConfig2,
        'responseType': defaultToConfig2,
        'xsrfCookieName': defaultToConfig2,
        'xsrfHeaderName': defaultToConfig2,
        'onUploadProgress': defaultToConfig2,
        'onDownloadProgress': defaultToConfig2,
        'decompress': defaultToConfig2,
        'maxContentLength': defaultToConfig2,
        'maxBodyLength': defaultToConfig2,
        'beforeRedirect': defaultToConfig2,
        'transport': defaultToConfig2,
        'httpAgent': defaultToConfig2,
        'httpsAgent': defaultToConfig2,
        'cancelToken': defaultToConfig2,
        'socketPath': defaultToConfig2,
        'responseEncoding': defaultToConfig2,
        'validateStatus': mergeDirectKeys
      };

      utils$2.forEach(Object.keys(config1).concat(Object.keys(config2)), function computeConfigValue(prop) {
        var merge = mergeMap[prop] || mergeDeepProperties;
        var configValue = merge(prop);
        (utils$2.isUndefined(configValue) && merge !== mergeDirectKeys) || (config[prop] = configValue);
      });

      return config;
    };

    var data;
    var hasRequiredData;

    function requireData () {
    	if (hasRequiredData) return data;
    	hasRequiredData = 1;
    	data = {
    	  "version": "0.27.2"
    	};
    	return data;
    }

    var VERSION = requireData().version;
    var AxiosError = requireAxiosError();

    var validators$1 = {};

    // eslint-disable-next-line func-names
    ['object', 'boolean', 'number', 'function', 'string', 'symbol'].forEach(function(type, i) {
      validators$1[type] = function validator(thing) {
        return typeof thing === type || 'a' + (i < 1 ? 'n ' : ' ') + type;
      };
    });

    var deprecatedWarnings = {};

    /**
     * Transitional option validator
     * @param {function|boolean?} validator - set to false if the transitional option has been removed
     * @param {string?} version - deprecated version / removed since version
     * @param {string?} message - some message with additional info
     * @returns {function}
     */
    validators$1.transitional = function transitional(validator, version, message) {
      function formatMessage(opt, desc) {
        return '[Axios v' + VERSION + '] Transitional option \'' + opt + '\'' + desc + (message ? '. ' + message : '');
      }

      // eslint-disable-next-line func-names
      return function(value, opt, opts) {
        if (validator === false) {
          throw new AxiosError(
            formatMessage(opt, ' has been removed' + (version ? ' in ' + version : '')),
            AxiosError.ERR_DEPRECATED
          );
        }

        if (version && !deprecatedWarnings[opt]) {
          deprecatedWarnings[opt] = true;
          // eslint-disable-next-line no-console
          console.warn(
            formatMessage(
              opt,
              ' has been deprecated since v' + version + ' and will be removed in the near future'
            )
          );
        }

        return validator ? validator(value, opt, opts) : true;
      };
    };

    /**
     * Assert object's properties type
     * @param {object} options
     * @param {object} schema
     * @param {boolean?} allowUnknown
     */

    function assertOptions(options, schema, allowUnknown) {
      if (typeof options !== 'object') {
        throw new AxiosError('options must be an object', AxiosError.ERR_BAD_OPTION_VALUE);
      }
      var keys = Object.keys(options);
      var i = keys.length;
      while (i-- > 0) {
        var opt = keys[i];
        var validator = schema[opt];
        if (validator) {
          var value = options[opt];
          var result = value === undefined || validator(value, opt, options);
          if (result !== true) {
            throw new AxiosError('option ' + opt + ' must be ' + result, AxiosError.ERR_BAD_OPTION_VALUE);
          }
          continue;
        }
        if (allowUnknown !== true) {
          throw new AxiosError('Unknown option ' + opt, AxiosError.ERR_BAD_OPTION);
        }
      }
    }

    var validator$1 = {
      assertOptions: assertOptions,
      validators: validators$1
    };

    var utils$1 = utils$9;
    var buildURL = buildURL$1;
    var InterceptorManager = InterceptorManager_1;
    var dispatchRequest = dispatchRequest$1;
    var mergeConfig$1 = mergeConfig$2;
    var buildFullPath = buildFullPath$1;
    var validator = validator$1;

    var validators = validator.validators;
    /**
     * Create a new instance of Axios
     *
     * @param {Object} instanceConfig The default config for the instance
     */
    function Axios$1(instanceConfig) {
      this.defaults = instanceConfig;
      this.interceptors = {
        request: new InterceptorManager(),
        response: new InterceptorManager()
      };
    }

    /**
     * Dispatch a request
     *
     * @param {Object} config The config specific for this request (merged with this.defaults)
     */
    Axios$1.prototype.request = function request(configOrUrl, config) {
      /*eslint no-param-reassign:0*/
      // Allow for axios('example/url'[, config]) a la fetch API
      if (typeof configOrUrl === 'string') {
        config = config || {};
        config.url = configOrUrl;
      } else {
        config = configOrUrl || {};
      }

      config = mergeConfig$1(this.defaults, config);

      // Set config.method
      if (config.method) {
        config.method = config.method.toLowerCase();
      } else if (this.defaults.method) {
        config.method = this.defaults.method.toLowerCase();
      } else {
        config.method = 'get';
      }

      var transitional = config.transitional;

      if (transitional !== undefined) {
        validator.assertOptions(transitional, {
          silentJSONParsing: validators.transitional(validators.boolean),
          forcedJSONParsing: validators.transitional(validators.boolean),
          clarifyTimeoutError: validators.transitional(validators.boolean)
        }, false);
      }

      // filter out skipped interceptors
      var requestInterceptorChain = [];
      var synchronousRequestInterceptors = true;
      this.interceptors.request.forEach(function unshiftRequestInterceptors(interceptor) {
        if (typeof interceptor.runWhen === 'function' && interceptor.runWhen(config) === false) {
          return;
        }

        synchronousRequestInterceptors = synchronousRequestInterceptors && interceptor.synchronous;

        requestInterceptorChain.unshift(interceptor.fulfilled, interceptor.rejected);
      });

      var responseInterceptorChain = [];
      this.interceptors.response.forEach(function pushResponseInterceptors(interceptor) {
        responseInterceptorChain.push(interceptor.fulfilled, interceptor.rejected);
      });

      var promise;

      if (!synchronousRequestInterceptors) {
        var chain = [dispatchRequest, undefined];

        Array.prototype.unshift.apply(chain, requestInterceptorChain);
        chain = chain.concat(responseInterceptorChain);

        promise = Promise.resolve(config);
        while (chain.length) {
          promise = promise.then(chain.shift(), chain.shift());
        }

        return promise;
      }


      var newConfig = config;
      while (requestInterceptorChain.length) {
        var onFulfilled = requestInterceptorChain.shift();
        var onRejected = requestInterceptorChain.shift();
        try {
          newConfig = onFulfilled(newConfig);
        } catch (error) {
          onRejected(error);
          break;
        }
      }

      try {
        promise = dispatchRequest(newConfig);
      } catch (error) {
        return Promise.reject(error);
      }

      while (responseInterceptorChain.length) {
        promise = promise.then(responseInterceptorChain.shift(), responseInterceptorChain.shift());
      }

      return promise;
    };

    Axios$1.prototype.getUri = function getUri(config) {
      config = mergeConfig$1(this.defaults, config);
      var fullPath = buildFullPath(config.baseURL, config.url);
      return buildURL(fullPath, config.params, config.paramsSerializer);
    };

    // Provide aliases for supported request methods
    utils$1.forEach(['delete', 'get', 'head', 'options'], function forEachMethodNoData(method) {
      /*eslint func-names:0*/
      Axios$1.prototype[method] = function(url, config) {
        return this.request(mergeConfig$1(config || {}, {
          method: method,
          url: url,
          data: (config || {}).data
        }));
      };
    });

    utils$1.forEach(['post', 'put', 'patch'], function forEachMethodWithData(method) {
      /*eslint func-names:0*/

      function generateHTTPMethod(isForm) {
        return function httpMethod(url, data, config) {
          return this.request(mergeConfig$1(config || {}, {
            method: method,
            headers: isForm ? {
              'Content-Type': 'multipart/form-data'
            } : {},
            url: url,
            data: data
          }));
        };
      }

      Axios$1.prototype[method] = generateHTTPMethod();

      Axios$1.prototype[method + 'Form'] = generateHTTPMethod(true);
    });

    var Axios_1 = Axios$1;

    var CancelToken_1;
    var hasRequiredCancelToken;

    function requireCancelToken () {
    	if (hasRequiredCancelToken) return CancelToken_1;
    	hasRequiredCancelToken = 1;

    	var CanceledError = requireCanceledError();

    	/**
    	 * A `CancelToken` is an object that can be used to request cancellation of an operation.
    	 *
    	 * @class
    	 * @param {Function} executor The executor function.
    	 */
    	function CancelToken(executor) {
    	  if (typeof executor !== 'function') {
    	    throw new TypeError('executor must be a function.');
    	  }

    	  var resolvePromise;

    	  this.promise = new Promise(function promiseExecutor(resolve) {
    	    resolvePromise = resolve;
    	  });

    	  var token = this;

    	  // eslint-disable-next-line func-names
    	  this.promise.then(function(cancel) {
    	    if (!token._listeners) return;

    	    var i;
    	    var l = token._listeners.length;

    	    for (i = 0; i < l; i++) {
    	      token._listeners[i](cancel);
    	    }
    	    token._listeners = null;
    	  });

    	  // eslint-disable-next-line func-names
    	  this.promise.then = function(onfulfilled) {
    	    var _resolve;
    	    // eslint-disable-next-line func-names
    	    var promise = new Promise(function(resolve) {
    	      token.subscribe(resolve);
    	      _resolve = resolve;
    	    }).then(onfulfilled);

    	    promise.cancel = function reject() {
    	      token.unsubscribe(_resolve);
    	    };

    	    return promise;
    	  };

    	  executor(function cancel(message) {
    	    if (token.reason) {
    	      // Cancellation has already been requested
    	      return;
    	    }

    	    token.reason = new CanceledError(message);
    	    resolvePromise(token.reason);
    	  });
    	}

    	/**
    	 * Throws a `CanceledError` if cancellation has been requested.
    	 */
    	CancelToken.prototype.throwIfRequested = function throwIfRequested() {
    	  if (this.reason) {
    	    throw this.reason;
    	  }
    	};

    	/**
    	 * Subscribe to the cancel signal
    	 */

    	CancelToken.prototype.subscribe = function subscribe(listener) {
    	  if (this.reason) {
    	    listener(this.reason);
    	    return;
    	  }

    	  if (this._listeners) {
    	    this._listeners.push(listener);
    	  } else {
    	    this._listeners = [listener];
    	  }
    	};

    	/**
    	 * Unsubscribe from the cancel signal
    	 */

    	CancelToken.prototype.unsubscribe = function unsubscribe(listener) {
    	  if (!this._listeners) {
    	    return;
    	  }
    	  var index = this._listeners.indexOf(listener);
    	  if (index !== -1) {
    	    this._listeners.splice(index, 1);
    	  }
    	};

    	/**
    	 * Returns an object that contains a new `CancelToken` and a function that, when called,
    	 * cancels the `CancelToken`.
    	 */
    	CancelToken.source = function source() {
    	  var cancel;
    	  var token = new CancelToken(function executor(c) {
    	    cancel = c;
    	  });
    	  return {
    	    token: token,
    	    cancel: cancel
    	  };
    	};

    	CancelToken_1 = CancelToken;
    	return CancelToken_1;
    }

    var spread;
    var hasRequiredSpread;

    function requireSpread () {
    	if (hasRequiredSpread) return spread;
    	hasRequiredSpread = 1;

    	/**
    	 * Syntactic sugar for invoking a function and expanding an array for arguments.
    	 *
    	 * Common use case would be to use `Function.prototype.apply`.
    	 *
    	 *  ```js
    	 *  function f(x, y, z) {}
    	 *  var args = [1, 2, 3];
    	 *  f.apply(null, args);
    	 *  ```
    	 *
    	 * With `spread` this example can be re-written.
    	 *
    	 *  ```js
    	 *  spread(function(x, y, z) {})([1, 2, 3]);
    	 *  ```
    	 *
    	 * @param {Function} callback
    	 * @returns {Function}
    	 */
    	spread = function spread(callback) {
    	  return function wrap(arr) {
    	    return callback.apply(null, arr);
    	  };
    	};
    	return spread;
    }

    var isAxiosError;
    var hasRequiredIsAxiosError;

    function requireIsAxiosError () {
    	if (hasRequiredIsAxiosError) return isAxiosError;
    	hasRequiredIsAxiosError = 1;

    	var utils = utils$9;

    	/**
    	 * Determines whether the payload is an error thrown by Axios
    	 *
    	 * @param {*} payload The value to test
    	 * @returns {boolean} True if the payload is an error thrown by Axios, otherwise false
    	 */
    	isAxiosError = function isAxiosError(payload) {
    	  return utils.isObject(payload) && (payload.isAxiosError === true);
    	};
    	return isAxiosError;
    }

    var utils = utils$9;
    var bind = bind$2;
    var Axios = Axios_1;
    var mergeConfig = mergeConfig$2;
    var defaults = defaults_1;

    /**
     * Create an instance of Axios
     *
     * @param {Object} defaultConfig The default config for the instance
     * @return {Axios} A new instance of Axios
     */
    function createInstance(defaultConfig) {
      var context = new Axios(defaultConfig);
      var instance = bind(Axios.prototype.request, context);

      // Copy axios.prototype to instance
      utils.extend(instance, Axios.prototype, context);

      // Copy context to instance
      utils.extend(instance, context);

      // Factory for creating new instances
      instance.create = function create(instanceConfig) {
        return createInstance(mergeConfig(defaultConfig, instanceConfig));
      };

      return instance;
    }

    // Create the default instance to be exported
    var axios$1 = createInstance(defaults);

    // Expose Axios class to allow class inheritance
    axios$1.Axios = Axios;

    // Expose Cancel & CancelToken
    axios$1.CanceledError = requireCanceledError();
    axios$1.CancelToken = requireCancelToken();
    axios$1.isCancel = requireIsCancel();
    axios$1.VERSION = requireData().version;
    axios$1.toFormData = requireToFormData();

    // Expose AxiosError class
    axios$1.AxiosError = requireAxiosError();

    // alias for CanceledError for backward compatibility
    axios$1.Cancel = axios$1.CanceledError;

    // Expose all/spread
    axios$1.all = function all(promises) {
      return Promise.all(promises);
    };
    axios$1.spread = requireSpread();

    // Expose isAxiosError
    axios$1.isAxiosError = requireIsAxiosError();

    axios$2.exports = axios$1;

    // Allow use of default import syntax in TypeScript
    axios$2.exports.default = axios$1;

    (function (module) {
    	module.exports = axios$2.exports;
    } (axios$3));

    var axios = /*@__PURE__*/getDefaultExportFromCjs(axios$3.exports);

    const PACKET_TYPES = Object.create(null); // no Map = no polyfill
    PACKET_TYPES["open"] = "0";
    PACKET_TYPES["close"] = "1";
    PACKET_TYPES["ping"] = "2";
    PACKET_TYPES["pong"] = "3";
    PACKET_TYPES["message"] = "4";
    PACKET_TYPES["upgrade"] = "5";
    PACKET_TYPES["noop"] = "6";
    const PACKET_TYPES_REVERSE = Object.create(null);
    Object.keys(PACKET_TYPES).forEach(key => {
        PACKET_TYPES_REVERSE[PACKET_TYPES[key]] = key;
    });
    const ERROR_PACKET = { type: "error", data: "parser error" };

    const withNativeBlob$1 = typeof Blob === "function" ||
        (typeof Blob !== "undefined" &&
            Object.prototype.toString.call(Blob) === "[object BlobConstructor]");
    const withNativeArrayBuffer$2 = typeof ArrayBuffer === "function";
    // ArrayBuffer.isView method is not defined in IE10
    const isView$1 = obj => {
        return typeof ArrayBuffer.isView === "function"
            ? ArrayBuffer.isView(obj)
            : obj && obj.buffer instanceof ArrayBuffer;
    };
    const encodePacket = ({ type, data }, supportsBinary, callback) => {
        if (withNativeBlob$1 && data instanceof Blob) {
            if (supportsBinary) {
                return callback(data);
            }
            else {
                return encodeBlobAsBase64(data, callback);
            }
        }
        else if (withNativeArrayBuffer$2 &&
            (data instanceof ArrayBuffer || isView$1(data))) {
            if (supportsBinary) {
                return callback(data);
            }
            else {
                return encodeBlobAsBase64(new Blob([data]), callback);
            }
        }
        // plain string
        return callback(PACKET_TYPES[type] + (data || ""));
    };
    const encodeBlobAsBase64 = (data, callback) => {
        const fileReader = new FileReader();
        fileReader.onload = function () {
            const content = fileReader.result.split(",")[1];
            callback("b" + content);
        };
        return fileReader.readAsDataURL(data);
    };

    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
    // Use a lookup table to find the index.
    const lookup$1 = typeof Uint8Array === 'undefined' ? [] : new Uint8Array(256);
    for (let i = 0; i < chars.length; i++) {
        lookup$1[chars.charCodeAt(i)] = i;
    }
    const decode$1 = (base64) => {
        let bufferLength = base64.length * 0.75, len = base64.length, i, p = 0, encoded1, encoded2, encoded3, encoded4;
        if (base64[base64.length - 1] === '=') {
            bufferLength--;
            if (base64[base64.length - 2] === '=') {
                bufferLength--;
            }
        }
        const arraybuffer = new ArrayBuffer(bufferLength), bytes = new Uint8Array(arraybuffer);
        for (i = 0; i < len; i += 4) {
            encoded1 = lookup$1[base64.charCodeAt(i)];
            encoded2 = lookup$1[base64.charCodeAt(i + 1)];
            encoded3 = lookup$1[base64.charCodeAt(i + 2)];
            encoded4 = lookup$1[base64.charCodeAt(i + 3)];
            bytes[p++] = (encoded1 << 2) | (encoded2 >> 4);
            bytes[p++] = ((encoded2 & 15) << 4) | (encoded3 >> 2);
            bytes[p++] = ((encoded3 & 3) << 6) | (encoded4 & 63);
        }
        return arraybuffer;
    };

    const withNativeArrayBuffer$1 = typeof ArrayBuffer === "function";
    const decodePacket = (encodedPacket, binaryType) => {
        if (typeof encodedPacket !== "string") {
            return {
                type: "message",
                data: mapBinary(encodedPacket, binaryType)
            };
        }
        const type = encodedPacket.charAt(0);
        if (type === "b") {
            return {
                type: "message",
                data: decodeBase64Packet(encodedPacket.substring(1), binaryType)
            };
        }
        const packetType = PACKET_TYPES_REVERSE[type];
        if (!packetType) {
            return ERROR_PACKET;
        }
        return encodedPacket.length > 1
            ? {
                type: PACKET_TYPES_REVERSE[type],
                data: encodedPacket.substring(1)
            }
            : {
                type: PACKET_TYPES_REVERSE[type]
            };
    };
    const decodeBase64Packet = (data, binaryType) => {
        if (withNativeArrayBuffer$1) {
            const decoded = decode$1(data);
            return mapBinary(decoded, binaryType);
        }
        else {
            return { base64: true, data }; // fallback for old browsers
        }
    };
    const mapBinary = (data, binaryType) => {
        switch (binaryType) {
            case "blob":
                return data instanceof ArrayBuffer ? new Blob([data]) : data;
            case "arraybuffer":
            default:
                return data; // assuming the data is already an ArrayBuffer
        }
    };

    const SEPARATOR = String.fromCharCode(30); // see https://en.wikipedia.org/wiki/Delimiter#ASCII_delimited_text
    const encodePayload = (packets, callback) => {
        // some packets may be added to the array while encoding, so the initial length must be saved
        const length = packets.length;
        const encodedPackets = new Array(length);
        let count = 0;
        packets.forEach((packet, i) => {
            // force base64 encoding for binary packets
            encodePacket(packet, false, encodedPacket => {
                encodedPackets[i] = encodedPacket;
                if (++count === length) {
                    callback(encodedPackets.join(SEPARATOR));
                }
            });
        });
    };
    const decodePayload = (encodedPayload, binaryType) => {
        const encodedPackets = encodedPayload.split(SEPARATOR);
        const packets = [];
        for (let i = 0; i < encodedPackets.length; i++) {
            const decodedPacket = decodePacket(encodedPackets[i], binaryType);
            packets.push(decodedPacket);
            if (decodedPacket.type === "error") {
                break;
            }
        }
        return packets;
    };
    const protocol$1 = 4;

    /**
     * Initialize a new `Emitter`.
     *
     * @api public
     */

    function Emitter(obj) {
      if (obj) return mixin(obj);
    }

    /**
     * Mixin the emitter properties.
     *
     * @param {Object} obj
     * @return {Object}
     * @api private
     */

    function mixin(obj) {
      for (var key in Emitter.prototype) {
        obj[key] = Emitter.prototype[key];
      }
      return obj;
    }

    /**
     * Listen on the given `event` with `fn`.
     *
     * @param {String} event
     * @param {Function} fn
     * @return {Emitter}
     * @api public
     */

    Emitter.prototype.on =
    Emitter.prototype.addEventListener = function(event, fn){
      this._callbacks = this._callbacks || {};
      (this._callbacks['$' + event] = this._callbacks['$' + event] || [])
        .push(fn);
      return this;
    };

    /**
     * Adds an `event` listener that will be invoked a single
     * time then automatically removed.
     *
     * @param {String} event
     * @param {Function} fn
     * @return {Emitter}
     * @api public
     */

    Emitter.prototype.once = function(event, fn){
      function on() {
        this.off(event, on);
        fn.apply(this, arguments);
      }

      on.fn = fn;
      this.on(event, on);
      return this;
    };

    /**
     * Remove the given callback for `event` or all
     * registered callbacks.
     *
     * @param {String} event
     * @param {Function} fn
     * @return {Emitter}
     * @api public
     */

    Emitter.prototype.off =
    Emitter.prototype.removeListener =
    Emitter.prototype.removeAllListeners =
    Emitter.prototype.removeEventListener = function(event, fn){
      this._callbacks = this._callbacks || {};

      // all
      if (0 == arguments.length) {
        this._callbacks = {};
        return this;
      }

      // specific event
      var callbacks = this._callbacks['$' + event];
      if (!callbacks) return this;

      // remove all handlers
      if (1 == arguments.length) {
        delete this._callbacks['$' + event];
        return this;
      }

      // remove specific handler
      var cb;
      for (var i = 0; i < callbacks.length; i++) {
        cb = callbacks[i];
        if (cb === fn || cb.fn === fn) {
          callbacks.splice(i, 1);
          break;
        }
      }

      // Remove event specific arrays for event types that no
      // one is subscribed for to avoid memory leak.
      if (callbacks.length === 0) {
        delete this._callbacks['$' + event];
      }

      return this;
    };

    /**
     * Emit `event` with the given args.
     *
     * @param {String} event
     * @param {Mixed} ...
     * @return {Emitter}
     */

    Emitter.prototype.emit = function(event){
      this._callbacks = this._callbacks || {};

      var args = new Array(arguments.length - 1)
        , callbacks = this._callbacks['$' + event];

      for (var i = 1; i < arguments.length; i++) {
        args[i - 1] = arguments[i];
      }

      if (callbacks) {
        callbacks = callbacks.slice(0);
        for (var i = 0, len = callbacks.length; i < len; ++i) {
          callbacks[i].apply(this, args);
        }
      }

      return this;
    };

    // alias used for reserved events (protected method)
    Emitter.prototype.emitReserved = Emitter.prototype.emit;

    /**
     * Return array of callbacks for `event`.
     *
     * @param {String} event
     * @return {Array}
     * @api public
     */

    Emitter.prototype.listeners = function(event){
      this._callbacks = this._callbacks || {};
      return this._callbacks['$' + event] || [];
    };

    /**
     * Check if this emitter has `event` handlers.
     *
     * @param {String} event
     * @return {Boolean}
     * @api public
     */

    Emitter.prototype.hasListeners = function(event){
      return !! this.listeners(event).length;
    };

    const globalThisShim = (() => {
        if (typeof self !== "undefined") {
            return self;
        }
        else if (typeof window !== "undefined") {
            return window;
        }
        else {
            return Function("return this")();
        }
    })();

    function pick(obj, ...attr) {
        return attr.reduce((acc, k) => {
            if (obj.hasOwnProperty(k)) {
                acc[k] = obj[k];
            }
            return acc;
        }, {});
    }
    // Keep a reference to the real timeout functions so they can be used when overridden
    const NATIVE_SET_TIMEOUT = setTimeout;
    const NATIVE_CLEAR_TIMEOUT = clearTimeout;
    function installTimerFunctions(obj, opts) {
        if (opts.useNativeTimers) {
            obj.setTimeoutFn = NATIVE_SET_TIMEOUT.bind(globalThisShim);
            obj.clearTimeoutFn = NATIVE_CLEAR_TIMEOUT.bind(globalThisShim);
        }
        else {
            obj.setTimeoutFn = setTimeout.bind(globalThisShim);
            obj.clearTimeoutFn = clearTimeout.bind(globalThisShim);
        }
    }
    // base64 encoded buffers are about 33% bigger (https://en.wikipedia.org/wiki/Base64)
    const BASE64_OVERHEAD = 1.33;
    // we could also have used `new Blob([obj]).size`, but it isn't supported in IE9
    function byteLength(obj) {
        if (typeof obj === "string") {
            return utf8Length(obj);
        }
        // arraybuffer or blob
        return Math.ceil((obj.byteLength || obj.size) * BASE64_OVERHEAD);
    }
    function utf8Length(str) {
        let c = 0, length = 0;
        for (let i = 0, l = str.length; i < l; i++) {
            c = str.charCodeAt(i);
            if (c < 0x80) {
                length += 1;
            }
            else if (c < 0x800) {
                length += 2;
            }
            else if (c < 0xd800 || c >= 0xe000) {
                length += 3;
            }
            else {
                i++;
                length += 4;
            }
        }
        return length;
    }

    class TransportError extends Error {
        constructor(reason, description, context) {
            super(reason);
            this.description = description;
            this.context = context;
            this.type = "TransportError";
        }
    }
    class Transport extends Emitter {
        /**
         * Transport abstract constructor.
         *
         * @param {Object} options.
         * @api private
         */
        constructor(opts) {
            super();
            this.writable = false;
            installTimerFunctions(this, opts);
            this.opts = opts;
            this.query = opts.query;
            this.readyState = "";
            this.socket = opts.socket;
        }
        /**
         * Emits an error.
         *
         * @param {String} reason
         * @param description
         * @param context - the error context
         * @return {Transport} for chaining
         * @api protected
         */
        onError(reason, description, context) {
            super.emitReserved("error", new TransportError(reason, description, context));
            return this;
        }
        /**
         * Opens the transport.
         *
         * @api public
         */
        open() {
            if ("closed" === this.readyState || "" === this.readyState) {
                this.readyState = "opening";
                this.doOpen();
            }
            return this;
        }
        /**
         * Closes the transport.
         *
         * @api public
         */
        close() {
            if ("opening" === this.readyState || "open" === this.readyState) {
                this.doClose();
                this.onClose();
            }
            return this;
        }
        /**
         * Sends multiple packets.
         *
         * @param {Array} packets
         * @api public
         */
        send(packets) {
            if ("open" === this.readyState) {
                this.write(packets);
            }
        }
        /**
         * Called upon open
         *
         * @api protected
         */
        onOpen() {
            this.readyState = "open";
            this.writable = true;
            super.emitReserved("open");
        }
        /**
         * Called with data.
         *
         * @param {String} data
         * @api protected
         */
        onData(data) {
            const packet = decodePacket(data, this.socket.binaryType);
            this.onPacket(packet);
        }
        /**
         * Called with a decoded packet.
         *
         * @api protected
         */
        onPacket(packet) {
            super.emitReserved("packet", packet);
        }
        /**
         * Called upon close.
         *
         * @api protected
         */
        onClose(details) {
            this.readyState = "closed";
            super.emitReserved("close", details);
        }
    }

    // imported from https://github.com/unshiftio/yeast
    const alphabet = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz-_'.split(''), length = 64, map$1 = {};
    let seed = 0, i = 0, prev;
    /**
     * Return a string representing the specified number.
     *
     * @param {Number} num The number to convert.
     * @returns {String} The string representation of the number.
     * @api public
     */
    function encode$1(num) {
        let encoded = '';
        do {
            encoded = alphabet[num % length] + encoded;
            num = Math.floor(num / length);
        } while (num > 0);
        return encoded;
    }
    /**
     * Yeast: A tiny growing id generator.
     *
     * @returns {String} A unique id.
     * @api public
     */
    function yeast() {
        const now = encode$1(+new Date());
        if (now !== prev)
            return seed = 0, prev = now;
        return now + '.' + encode$1(seed++);
    }
    //
    // Map each character to its index.
    //
    for (; i < length; i++)
        map$1[alphabet[i]] = i;

    // imported from https://github.com/galkn/querystring
    /**
     * Compiles a querystring
     * Returns string representation of the object
     *
     * @param {Object}
     * @api private
     */
    function encode(obj) {
        let str = '';
        for (let i in obj) {
            if (obj.hasOwnProperty(i)) {
                if (str.length)
                    str += '&';
                str += encodeURIComponent(i) + '=' + encodeURIComponent(obj[i]);
            }
        }
        return str;
    }
    /**
     * Parses a simple querystring into an object
     *
     * @param {String} qs
     * @api private
     */
    function decode(qs) {
        let qry = {};
        let pairs = qs.split('&');
        for (let i = 0, l = pairs.length; i < l; i++) {
            let pair = pairs[i].split('=');
            qry[decodeURIComponent(pair[0])] = decodeURIComponent(pair[1]);
        }
        return qry;
    }

    // imported from https://github.com/component/has-cors
    let value = false;
    try {
        value = typeof XMLHttpRequest !== 'undefined' &&
            'withCredentials' in new XMLHttpRequest();
    }
    catch (err) {
        // if XMLHttp support is disabled in IE then it will throw
        // when trying to create
    }
    const hasCORS = value;

    // browser shim for xmlhttprequest module
    function XHR(opts) {
        const xdomain = opts.xdomain;
        // XMLHttpRequest can be disabled on IE
        try {
            if ("undefined" !== typeof XMLHttpRequest && (!xdomain || hasCORS)) {
                return new XMLHttpRequest();
            }
        }
        catch (e) { }
        if (!xdomain) {
            try {
                return new globalThisShim[["Active"].concat("Object").join("X")]("Microsoft.XMLHTTP");
            }
            catch (e) { }
        }
    }

    function empty() { }
    const hasXHR2 = (function () {
        const xhr = new XHR({
            xdomain: false
        });
        return null != xhr.responseType;
    })();
    class Polling extends Transport {
        /**
         * XHR Polling constructor.
         *
         * @param {Object} opts
         * @api public
         */
        constructor(opts) {
            super(opts);
            this.polling = false;
            if (typeof location !== "undefined") {
                const isSSL = "https:" === location.protocol;
                let port = location.port;
                // some user agents have empty `location.port`
                if (!port) {
                    port = isSSL ? "443" : "80";
                }
                this.xd =
                    (typeof location !== "undefined" &&
                        opts.hostname !== location.hostname) ||
                        port !== opts.port;
                this.xs = opts.secure !== isSSL;
            }
            /**
             * XHR supports binary
             */
            const forceBase64 = opts && opts.forceBase64;
            this.supportsBinary = hasXHR2 && !forceBase64;
        }
        /**
         * Transport name.
         */
        get name() {
            return "polling";
        }
        /**
         * Opens the socket (triggers polling). We write a PING message to determine
         * when the transport is open.
         *
         * @api private
         */
        doOpen() {
            this.poll();
        }
        /**
         * Pauses polling.
         *
         * @param {Function} callback upon buffers are flushed and transport is paused
         * @api private
         */
        pause(onPause) {
            this.readyState = "pausing";
            const pause = () => {
                this.readyState = "paused";
                onPause();
            };
            if (this.polling || !this.writable) {
                let total = 0;
                if (this.polling) {
                    total++;
                    this.once("pollComplete", function () {
                        --total || pause();
                    });
                }
                if (!this.writable) {
                    total++;
                    this.once("drain", function () {
                        --total || pause();
                    });
                }
            }
            else {
                pause();
            }
        }
        /**
         * Starts polling cycle.
         *
         * @api public
         */
        poll() {
            this.polling = true;
            this.doPoll();
            this.emitReserved("poll");
        }
        /**
         * Overloads onData to detect payloads.
         *
         * @api private
         */
        onData(data) {
            const callback = packet => {
                // if its the first message we consider the transport open
                if ("opening" === this.readyState && packet.type === "open") {
                    this.onOpen();
                }
                // if its a close packet, we close the ongoing requests
                if ("close" === packet.type) {
                    this.onClose({ description: "transport closed by the server" });
                    return false;
                }
                // otherwise bypass onData and handle the message
                this.onPacket(packet);
            };
            // decode payload
            decodePayload(data, this.socket.binaryType).forEach(callback);
            // if an event did not trigger closing
            if ("closed" !== this.readyState) {
                // if we got data we're not polling
                this.polling = false;
                this.emitReserved("pollComplete");
                if ("open" === this.readyState) {
                    this.poll();
                }
            }
        }
        /**
         * For polling, send a close packet.
         *
         * @api private
         */
        doClose() {
            const close = () => {
                this.write([{ type: "close" }]);
            };
            if ("open" === this.readyState) {
                close();
            }
            else {
                // in case we're trying to close while
                // handshaking is in progress (GH-164)
                this.once("open", close);
            }
        }
        /**
         * Writes a packets payload.
         *
         * @param {Array} data packets
         * @param {Function} drain callback
         * @api private
         */
        write(packets) {
            this.writable = false;
            encodePayload(packets, data => {
                this.doWrite(data, () => {
                    this.writable = true;
                    this.emitReserved("drain");
                });
            });
        }
        /**
         * Generates uri for connection.
         *
         * @api private
         */
        uri() {
            let query = this.query || {};
            const schema = this.opts.secure ? "https" : "http";
            let port = "";
            // cache busting is forced
            if (false !== this.opts.timestampRequests) {
                query[this.opts.timestampParam] = yeast();
            }
            if (!this.supportsBinary && !query.sid) {
                query.b64 = 1;
            }
            // avoid port if default for schema
            if (this.opts.port &&
                (("https" === schema && Number(this.opts.port) !== 443) ||
                    ("http" === schema && Number(this.opts.port) !== 80))) {
                port = ":" + this.opts.port;
            }
            const encodedQuery = encode(query);
            const ipv6 = this.opts.hostname.indexOf(":") !== -1;
            return (schema +
                "://" +
                (ipv6 ? "[" + this.opts.hostname + "]" : this.opts.hostname) +
                port +
                this.opts.path +
                (encodedQuery.length ? "?" + encodedQuery : ""));
        }
        /**
         * Creates a request.
         *
         * @param {String} method
         * @api private
         */
        request(opts = {}) {
            Object.assign(opts, { xd: this.xd, xs: this.xs }, this.opts);
            return new Request(this.uri(), opts);
        }
        /**
         * Sends data.
         *
         * @param {String} data to send.
         * @param {Function} called upon flush.
         * @api private
         */
        doWrite(data, fn) {
            const req = this.request({
                method: "POST",
                data: data
            });
            req.on("success", fn);
            req.on("error", (xhrStatus, context) => {
                this.onError("xhr post error", xhrStatus, context);
            });
        }
        /**
         * Starts a poll cycle.
         *
         * @api private
         */
        doPoll() {
            const req = this.request();
            req.on("data", this.onData.bind(this));
            req.on("error", (xhrStatus, context) => {
                this.onError("xhr poll error", xhrStatus, context);
            });
            this.pollXhr = req;
        }
    }
    class Request extends Emitter {
        /**
         * Request constructor
         *
         * @param {Object} options
         * @api public
         */
        constructor(uri, opts) {
            super();
            installTimerFunctions(this, opts);
            this.opts = opts;
            this.method = opts.method || "GET";
            this.uri = uri;
            this.async = false !== opts.async;
            this.data = undefined !== opts.data ? opts.data : null;
            this.create();
        }
        /**
         * Creates the XHR object and sends the request.
         *
         * @api private
         */
        create() {
            const opts = pick(this.opts, "agent", "pfx", "key", "passphrase", "cert", "ca", "ciphers", "rejectUnauthorized", "autoUnref");
            opts.xdomain = !!this.opts.xd;
            opts.xscheme = !!this.opts.xs;
            const xhr = (this.xhr = new XHR(opts));
            try {
                xhr.open(this.method, this.uri, this.async);
                try {
                    if (this.opts.extraHeaders) {
                        xhr.setDisableHeaderCheck && xhr.setDisableHeaderCheck(true);
                        for (let i in this.opts.extraHeaders) {
                            if (this.opts.extraHeaders.hasOwnProperty(i)) {
                                xhr.setRequestHeader(i, this.opts.extraHeaders[i]);
                            }
                        }
                    }
                }
                catch (e) { }
                if ("POST" === this.method) {
                    try {
                        xhr.setRequestHeader("Content-type", "text/plain;charset=UTF-8");
                    }
                    catch (e) { }
                }
                try {
                    xhr.setRequestHeader("Accept", "*/*");
                }
                catch (e) { }
                // ie6 check
                if ("withCredentials" in xhr) {
                    xhr.withCredentials = this.opts.withCredentials;
                }
                if (this.opts.requestTimeout) {
                    xhr.timeout = this.opts.requestTimeout;
                }
                xhr.onreadystatechange = () => {
                    if (4 !== xhr.readyState)
                        return;
                    if (200 === xhr.status || 1223 === xhr.status) {
                        this.onLoad();
                    }
                    else {
                        // make sure the `error` event handler that's user-set
                        // does not throw in the same tick and gets caught here
                        this.setTimeoutFn(() => {
                            this.onError(typeof xhr.status === "number" ? xhr.status : 0);
                        }, 0);
                    }
                };
                xhr.send(this.data);
            }
            catch (e) {
                // Need to defer since .create() is called directly from the constructor
                // and thus the 'error' event can only be only bound *after* this exception
                // occurs.  Therefore, also, we cannot throw here at all.
                this.setTimeoutFn(() => {
                    this.onError(e);
                }, 0);
                return;
            }
            if (typeof document !== "undefined") {
                this.index = Request.requestsCount++;
                Request.requests[this.index] = this;
            }
        }
        /**
         * Called upon error.
         *
         * @api private
         */
        onError(err) {
            this.emitReserved("error", err, this.xhr);
            this.cleanup(true);
        }
        /**
         * Cleans up house.
         *
         * @api private
         */
        cleanup(fromError) {
            if ("undefined" === typeof this.xhr || null === this.xhr) {
                return;
            }
            this.xhr.onreadystatechange = empty;
            if (fromError) {
                try {
                    this.xhr.abort();
                }
                catch (e) { }
            }
            if (typeof document !== "undefined") {
                delete Request.requests[this.index];
            }
            this.xhr = null;
        }
        /**
         * Called upon load.
         *
         * @api private
         */
        onLoad() {
            const data = this.xhr.responseText;
            if (data !== null) {
                this.emitReserved("data", data);
                this.emitReserved("success");
                this.cleanup();
            }
        }
        /**
         * Aborts the request.
         *
         * @api public
         */
        abort() {
            this.cleanup();
        }
    }
    Request.requestsCount = 0;
    Request.requests = {};
    /**
     * Aborts pending requests when unloading the window. This is needed to prevent
     * memory leaks (e.g. when using IE) and to ensure that no spurious error is
     * emitted.
     */
    if (typeof document !== "undefined") {
        // @ts-ignore
        if (typeof attachEvent === "function") {
            // @ts-ignore
            attachEvent("onunload", unloadHandler);
        }
        else if (typeof addEventListener === "function") {
            const terminationEvent = "onpagehide" in globalThisShim ? "pagehide" : "unload";
            addEventListener(terminationEvent, unloadHandler, false);
        }
    }
    function unloadHandler() {
        for (let i in Request.requests) {
            if (Request.requests.hasOwnProperty(i)) {
                Request.requests[i].abort();
            }
        }
    }

    const nextTick = (() => {
        const isPromiseAvailable = typeof Promise === "function" && typeof Promise.resolve === "function";
        if (isPromiseAvailable) {
            return cb => Promise.resolve().then(cb);
        }
        else {
            return (cb, setTimeoutFn) => setTimeoutFn(cb, 0);
        }
    })();
    const WebSocket = globalThisShim.WebSocket || globalThisShim.MozWebSocket;
    const usingBrowserWebSocket = true;
    const defaultBinaryType = "arraybuffer";

    // detect ReactNative environment
    const isReactNative = typeof navigator !== "undefined" &&
        typeof navigator.product === "string" &&
        navigator.product.toLowerCase() === "reactnative";
    class WS extends Transport {
        /**
         * WebSocket transport constructor.
         *
         * @api {Object} connection options
         * @api public
         */
        constructor(opts) {
            super(opts);
            this.supportsBinary = !opts.forceBase64;
        }
        /**
         * Transport name.
         *
         * @api public
         */
        get name() {
            return "websocket";
        }
        /**
         * Opens socket.
         *
         * @api private
         */
        doOpen() {
            if (!this.check()) {
                // let probe timeout
                return;
            }
            const uri = this.uri();
            const protocols = this.opts.protocols;
            // React Native only supports the 'headers' option, and will print a warning if anything else is passed
            const opts = isReactNative
                ? {}
                : pick(this.opts, "agent", "perMessageDeflate", "pfx", "key", "passphrase", "cert", "ca", "ciphers", "rejectUnauthorized", "localAddress", "protocolVersion", "origin", "maxPayload", "family", "checkServerIdentity");
            if (this.opts.extraHeaders) {
                opts.headers = this.opts.extraHeaders;
            }
            try {
                this.ws =
                    usingBrowserWebSocket && !isReactNative
                        ? protocols
                            ? new WebSocket(uri, protocols)
                            : new WebSocket(uri)
                        : new WebSocket(uri, protocols, opts);
            }
            catch (err) {
                return this.emitReserved("error", err);
            }
            this.ws.binaryType = this.socket.binaryType || defaultBinaryType;
            this.addEventListeners();
        }
        /**
         * Adds event listeners to the socket
         *
         * @api private
         */
        addEventListeners() {
            this.ws.onopen = () => {
                if (this.opts.autoUnref) {
                    this.ws._socket.unref();
                }
                this.onOpen();
            };
            this.ws.onclose = closeEvent => this.onClose({
                description: "websocket connection closed",
                context: closeEvent
            });
            this.ws.onmessage = ev => this.onData(ev.data);
            this.ws.onerror = e => this.onError("websocket error", e);
        }
        /**
         * Writes data to socket.
         *
         * @param {Array} array of packets.
         * @api private
         */
        write(packets) {
            this.writable = false;
            // encodePacket efficient as it uses WS framing
            // no need for encodePayload
            for (let i = 0; i < packets.length; i++) {
                const packet = packets[i];
                const lastPacket = i === packets.length - 1;
                encodePacket(packet, this.supportsBinary, data => {
                    // always create a new object (GH-437)
                    const opts = {};
                    // Sometimes the websocket has already been closed but the browser didn't
                    // have a chance of informing us about it yet, in that case send will
                    // throw an error
                    try {
                        if (usingBrowserWebSocket) {
                            // TypeError is thrown when passing the second argument on Safari
                            this.ws.send(data);
                        }
                    }
                    catch (e) {
                    }
                    if (lastPacket) {
                        // fake drain
                        // defer to next tick to allow Socket to clear writeBuffer
                        nextTick(() => {
                            this.writable = true;
                            this.emitReserved("drain");
                        }, this.setTimeoutFn);
                    }
                });
            }
        }
        /**
         * Closes socket.
         *
         * @api private
         */
        doClose() {
            if (typeof this.ws !== "undefined") {
                this.ws.close();
                this.ws = null;
            }
        }
        /**
         * Generates uri for connection.
         *
         * @api private
         */
        uri() {
            let query = this.query || {};
            const schema = this.opts.secure ? "wss" : "ws";
            let port = "";
            // avoid port if default for schema
            if (this.opts.port &&
                (("wss" === schema && Number(this.opts.port) !== 443) ||
                    ("ws" === schema && Number(this.opts.port) !== 80))) {
                port = ":" + this.opts.port;
            }
            // append timestamp to URI
            if (this.opts.timestampRequests) {
                query[this.opts.timestampParam] = yeast();
            }
            // communicate binary support capabilities
            if (!this.supportsBinary) {
                query.b64 = 1;
            }
            const encodedQuery = encode(query);
            const ipv6 = this.opts.hostname.indexOf(":") !== -1;
            return (schema +
                "://" +
                (ipv6 ? "[" + this.opts.hostname + "]" : this.opts.hostname) +
                port +
                this.opts.path +
                (encodedQuery.length ? "?" + encodedQuery : ""));
        }
        /**
         * Feature detection for WebSocket.
         *
         * @return {Boolean} whether this transport is available.
         * @api public
         */
        check() {
            return !!WebSocket;
        }
    }

    const transports = {
        websocket: WS,
        polling: Polling
    };

    // imported from https://github.com/galkn/parseuri
    /**
     * Parses an URI
     *
     * @author Steven Levithan <stevenlevithan.com> (MIT license)
     * @api private
     */
    const re = /^(?:(?![^:@]+:[^:@\/]*@)(http|https|ws|wss):\/\/)?((?:(([^:@]*)(?::([^:@]*))?)?@)?((?:[a-f0-9]{0,4}:){2,7}[a-f0-9]{0,4}|[^:\/?#]*)(?::(\d*))?)(((\/(?:[^?#](?![^?#\/]*\.[^?#\/.]+(?:[?#]|$)))*\/?)?([^?#\/]*))(?:\?([^#]*))?(?:#(.*))?)/;
    const parts = [
        'source', 'protocol', 'authority', 'userInfo', 'user', 'password', 'host', 'port', 'relative', 'path', 'directory', 'file', 'query', 'anchor'
    ];
    function parse(str) {
        const src = str, b = str.indexOf('['), e = str.indexOf(']');
        if (b != -1 && e != -1) {
            str = str.substring(0, b) + str.substring(b, e).replace(/:/g, ';') + str.substring(e, str.length);
        }
        let m = re.exec(str || ''), uri = {}, i = 14;
        while (i--) {
            uri[parts[i]] = m[i] || '';
        }
        if (b != -1 && e != -1) {
            uri.source = src;
            uri.host = uri.host.substring(1, uri.host.length - 1).replace(/;/g, ':');
            uri.authority = uri.authority.replace('[', '').replace(']', '').replace(/;/g, ':');
            uri.ipv6uri = true;
        }
        uri.pathNames = pathNames(uri, uri['path']);
        uri.queryKey = queryKey(uri, uri['query']);
        return uri;
    }
    function pathNames(obj, path) {
        const regx = /\/{2,9}/g, names = path.replace(regx, "/").split("/");
        if (path.substr(0, 1) == '/' || path.length === 0) {
            names.splice(0, 1);
        }
        if (path.substr(path.length - 1, 1) == '/') {
            names.splice(names.length - 1, 1);
        }
        return names;
    }
    function queryKey(uri, query) {
        const data = {};
        query.replace(/(?:^|&)([^&=]*)=?([^&]*)/g, function ($0, $1, $2) {
            if ($1) {
                data[$1] = $2;
            }
        });
        return data;
    }

    class Socket$1 extends Emitter {
        /**
         * Socket constructor.
         *
         * @param {String|Object} uri or options
         * @param {Object} opts - options
         * @api public
         */
        constructor(uri, opts = {}) {
            super();
            if (uri && "object" === typeof uri) {
                opts = uri;
                uri = null;
            }
            if (uri) {
                uri = parse(uri);
                opts.hostname = uri.host;
                opts.secure = uri.protocol === "https" || uri.protocol === "wss";
                opts.port = uri.port;
                if (uri.query)
                    opts.query = uri.query;
            }
            else if (opts.host) {
                opts.hostname = parse(opts.host).host;
            }
            installTimerFunctions(this, opts);
            this.secure =
                null != opts.secure
                    ? opts.secure
                    : typeof location !== "undefined" && "https:" === location.protocol;
            if (opts.hostname && !opts.port) {
                // if no port is specified manually, use the protocol default
                opts.port = this.secure ? "443" : "80";
            }
            this.hostname =
                opts.hostname ||
                    (typeof location !== "undefined" ? location.hostname : "localhost");
            this.port =
                opts.port ||
                    (typeof location !== "undefined" && location.port
                        ? location.port
                        : this.secure
                            ? "443"
                            : "80");
            this.transports = opts.transports || ["polling", "websocket"];
            this.readyState = "";
            this.writeBuffer = [];
            this.prevBufferLen = 0;
            this.opts = Object.assign({
                path: "/engine.io",
                agent: false,
                withCredentials: false,
                upgrade: true,
                timestampParam: "t",
                rememberUpgrade: false,
                rejectUnauthorized: true,
                perMessageDeflate: {
                    threshold: 1024
                },
                transportOptions: {},
                closeOnBeforeunload: true
            }, opts);
            this.opts.path = this.opts.path.replace(/\/$/, "") + "/";
            if (typeof this.opts.query === "string") {
                this.opts.query = decode(this.opts.query);
            }
            // set on handshake
            this.id = null;
            this.upgrades = null;
            this.pingInterval = null;
            this.pingTimeout = null;
            // set on heartbeat
            this.pingTimeoutTimer = null;
            if (typeof addEventListener === "function") {
                if (this.opts.closeOnBeforeunload) {
                    // Firefox closes the connection when the "beforeunload" event is emitted but not Chrome. This event listener
                    // ensures every browser behaves the same (no "disconnect" event at the Socket.IO level when the page is
                    // closed/reloaded)
                    addEventListener("beforeunload", () => {
                        if (this.transport) {
                            // silently close the transport
                            this.transport.removeAllListeners();
                            this.transport.close();
                        }
                    }, false);
                }
                if (this.hostname !== "localhost") {
                    this.offlineEventListener = () => {
                        this.onClose("transport close", {
                            description: "network connection lost"
                        });
                    };
                    addEventListener("offline", this.offlineEventListener, false);
                }
            }
            this.open();
        }
        /**
         * Creates transport of the given type.
         *
         * @param {String} transport name
         * @return {Transport}
         * @api private
         */
        createTransport(name) {
            const query = Object.assign({}, this.opts.query);
            // append engine.io protocol identifier
            query.EIO = protocol$1;
            // transport name
            query.transport = name;
            // session id if we already have one
            if (this.id)
                query.sid = this.id;
            const opts = Object.assign({}, this.opts.transportOptions[name], this.opts, {
                query,
                socket: this,
                hostname: this.hostname,
                secure: this.secure,
                port: this.port
            });
            return new transports[name](opts);
        }
        /**
         * Initializes transport to use and starts probe.
         *
         * @api private
         */
        open() {
            let transport;
            if (this.opts.rememberUpgrade &&
                Socket$1.priorWebsocketSuccess &&
                this.transports.indexOf("websocket") !== -1) {
                transport = "websocket";
            }
            else if (0 === this.transports.length) {
                // Emit error on next tick so it can be listened to
                this.setTimeoutFn(() => {
                    this.emitReserved("error", "No transports available");
                }, 0);
                return;
            }
            else {
                transport = this.transports[0];
            }
            this.readyState = "opening";
            // Retry with the next transport if the transport is disabled (jsonp: false)
            try {
                transport = this.createTransport(transport);
            }
            catch (e) {
                this.transports.shift();
                this.open();
                return;
            }
            transport.open();
            this.setTransport(transport);
        }
        /**
         * Sets the current transport. Disables the existing one (if any).
         *
         * @api private
         */
        setTransport(transport) {
            if (this.transport) {
                this.transport.removeAllListeners();
            }
            // set up transport
            this.transport = transport;
            // set up transport listeners
            transport
                .on("drain", this.onDrain.bind(this))
                .on("packet", this.onPacket.bind(this))
                .on("error", this.onError.bind(this))
                .on("close", reason => this.onClose("transport close", reason));
        }
        /**
         * Probes a transport.
         *
         * @param {String} transport name
         * @api private
         */
        probe(name) {
            let transport = this.createTransport(name);
            let failed = false;
            Socket$1.priorWebsocketSuccess = false;
            const onTransportOpen = () => {
                if (failed)
                    return;
                transport.send([{ type: "ping", data: "probe" }]);
                transport.once("packet", msg => {
                    if (failed)
                        return;
                    if ("pong" === msg.type && "probe" === msg.data) {
                        this.upgrading = true;
                        this.emitReserved("upgrading", transport);
                        if (!transport)
                            return;
                        Socket$1.priorWebsocketSuccess = "websocket" === transport.name;
                        this.transport.pause(() => {
                            if (failed)
                                return;
                            if ("closed" === this.readyState)
                                return;
                            cleanup();
                            this.setTransport(transport);
                            transport.send([{ type: "upgrade" }]);
                            this.emitReserved("upgrade", transport);
                            transport = null;
                            this.upgrading = false;
                            this.flush();
                        });
                    }
                    else {
                        const err = new Error("probe error");
                        // @ts-ignore
                        err.transport = transport.name;
                        this.emitReserved("upgradeError", err);
                    }
                });
            };
            function freezeTransport() {
                if (failed)
                    return;
                // Any callback called by transport should be ignored since now
                failed = true;
                cleanup();
                transport.close();
                transport = null;
            }
            // Handle any error that happens while probing
            const onerror = err => {
                const error = new Error("probe error: " + err);
                // @ts-ignore
                error.transport = transport.name;
                freezeTransport();
                this.emitReserved("upgradeError", error);
            };
            function onTransportClose() {
                onerror("transport closed");
            }
            // When the socket is closed while we're probing
            function onclose() {
                onerror("socket closed");
            }
            // When the socket is upgraded while we're probing
            function onupgrade(to) {
                if (transport && to.name !== transport.name) {
                    freezeTransport();
                }
            }
            // Remove all listeners on the transport and on self
            const cleanup = () => {
                transport.removeListener("open", onTransportOpen);
                transport.removeListener("error", onerror);
                transport.removeListener("close", onTransportClose);
                this.off("close", onclose);
                this.off("upgrading", onupgrade);
            };
            transport.once("open", onTransportOpen);
            transport.once("error", onerror);
            transport.once("close", onTransportClose);
            this.once("close", onclose);
            this.once("upgrading", onupgrade);
            transport.open();
        }
        /**
         * Called when connection is deemed open.
         *
         * @api private
         */
        onOpen() {
            this.readyState = "open";
            Socket$1.priorWebsocketSuccess = "websocket" === this.transport.name;
            this.emitReserved("open");
            this.flush();
            // we check for `readyState` in case an `open`
            // listener already closed the socket
            if ("open" === this.readyState &&
                this.opts.upgrade &&
                this.transport.pause) {
                let i = 0;
                const l = this.upgrades.length;
                for (; i < l; i++) {
                    this.probe(this.upgrades[i]);
                }
            }
        }
        /**
         * Handles a packet.
         *
         * @api private
         */
        onPacket(packet) {
            if ("opening" === this.readyState ||
                "open" === this.readyState ||
                "closing" === this.readyState) {
                this.emitReserved("packet", packet);
                // Socket is live - any packet counts
                this.emitReserved("heartbeat");
                switch (packet.type) {
                    case "open":
                        this.onHandshake(JSON.parse(packet.data));
                        break;
                    case "ping":
                        this.resetPingTimeout();
                        this.sendPacket("pong");
                        this.emitReserved("ping");
                        this.emitReserved("pong");
                        break;
                    case "error":
                        const err = new Error("server error");
                        // @ts-ignore
                        err.code = packet.data;
                        this.onError(err);
                        break;
                    case "message":
                        this.emitReserved("data", packet.data);
                        this.emitReserved("message", packet.data);
                        break;
                }
            }
        }
        /**
         * Called upon handshake completion.
         *
         * @param {Object} data - handshake obj
         * @api private
         */
        onHandshake(data) {
            this.emitReserved("handshake", data);
            this.id = data.sid;
            this.transport.query.sid = data.sid;
            this.upgrades = this.filterUpgrades(data.upgrades);
            this.pingInterval = data.pingInterval;
            this.pingTimeout = data.pingTimeout;
            this.maxPayload = data.maxPayload;
            this.onOpen();
            // In case open handler closes socket
            if ("closed" === this.readyState)
                return;
            this.resetPingTimeout();
        }
        /**
         * Sets and resets ping timeout timer based on server pings.
         *
         * @api private
         */
        resetPingTimeout() {
            this.clearTimeoutFn(this.pingTimeoutTimer);
            this.pingTimeoutTimer = this.setTimeoutFn(() => {
                this.onClose("ping timeout");
            }, this.pingInterval + this.pingTimeout);
            if (this.opts.autoUnref) {
                this.pingTimeoutTimer.unref();
            }
        }
        /**
         * Called on `drain` event
         *
         * @api private
         */
        onDrain() {
            this.writeBuffer.splice(0, this.prevBufferLen);
            // setting prevBufferLen = 0 is very important
            // for example, when upgrading, upgrade packet is sent over,
            // and a nonzero prevBufferLen could cause problems on `drain`
            this.prevBufferLen = 0;
            if (0 === this.writeBuffer.length) {
                this.emitReserved("drain");
            }
            else {
                this.flush();
            }
        }
        /**
         * Flush write buffers.
         *
         * @api private
         */
        flush() {
            if ("closed" !== this.readyState &&
                this.transport.writable &&
                !this.upgrading &&
                this.writeBuffer.length) {
                const packets = this.getWritablePackets();
                this.transport.send(packets);
                // keep track of current length of writeBuffer
                // splice writeBuffer and callbackBuffer on `drain`
                this.prevBufferLen = packets.length;
                this.emitReserved("flush");
            }
        }
        /**
         * Ensure the encoded size of the writeBuffer is below the maxPayload value sent by the server (only for HTTP
         * long-polling)
         *
         * @private
         */
        getWritablePackets() {
            const shouldCheckPayloadSize = this.maxPayload &&
                this.transport.name === "polling" &&
                this.writeBuffer.length > 1;
            if (!shouldCheckPayloadSize) {
                return this.writeBuffer;
            }
            let payloadSize = 1; // first packet type
            for (let i = 0; i < this.writeBuffer.length; i++) {
                const data = this.writeBuffer[i].data;
                if (data) {
                    payloadSize += byteLength(data);
                }
                if (i > 0 && payloadSize > this.maxPayload) {
                    return this.writeBuffer.slice(0, i);
                }
                payloadSize += 2; // separator + packet type
            }
            return this.writeBuffer;
        }
        /**
         * Sends a message.
         *
         * @param {String} message.
         * @param {Function} callback function.
         * @param {Object} options.
         * @return {Socket} for chaining.
         * @api public
         */
        write(msg, options, fn) {
            this.sendPacket("message", msg, options, fn);
            return this;
        }
        send(msg, options, fn) {
            this.sendPacket("message", msg, options, fn);
            return this;
        }
        /**
         * Sends a packet.
         *
         * @param {String} packet type.
         * @param {String} data.
         * @param {Object} options.
         * @param {Function} callback function.
         * @api private
         */
        sendPacket(type, data, options, fn) {
            if ("function" === typeof data) {
                fn = data;
                data = undefined;
            }
            if ("function" === typeof options) {
                fn = options;
                options = null;
            }
            if ("closing" === this.readyState || "closed" === this.readyState) {
                return;
            }
            options = options || {};
            options.compress = false !== options.compress;
            const packet = {
                type: type,
                data: data,
                options: options
            };
            this.emitReserved("packetCreate", packet);
            this.writeBuffer.push(packet);
            if (fn)
                this.once("flush", fn);
            this.flush();
        }
        /**
         * Closes the connection.
         *
         * @api public
         */
        close() {
            const close = () => {
                this.onClose("forced close");
                this.transport.close();
            };
            const cleanupAndClose = () => {
                this.off("upgrade", cleanupAndClose);
                this.off("upgradeError", cleanupAndClose);
                close();
            };
            const waitForUpgrade = () => {
                // wait for upgrade to finish since we can't send packets while pausing a transport
                this.once("upgrade", cleanupAndClose);
                this.once("upgradeError", cleanupAndClose);
            };
            if ("opening" === this.readyState || "open" === this.readyState) {
                this.readyState = "closing";
                if (this.writeBuffer.length) {
                    this.once("drain", () => {
                        if (this.upgrading) {
                            waitForUpgrade();
                        }
                        else {
                            close();
                        }
                    });
                }
                else if (this.upgrading) {
                    waitForUpgrade();
                }
                else {
                    close();
                }
            }
            return this;
        }
        /**
         * Called upon transport error
         *
         * @api private
         */
        onError(err) {
            Socket$1.priorWebsocketSuccess = false;
            this.emitReserved("error", err);
            this.onClose("transport error", err);
        }
        /**
         * Called upon transport close.
         *
         * @api private
         */
        onClose(reason, description) {
            if ("opening" === this.readyState ||
                "open" === this.readyState ||
                "closing" === this.readyState) {
                // clear timers
                this.clearTimeoutFn(this.pingTimeoutTimer);
                // stop event from firing again for transport
                this.transport.removeAllListeners("close");
                // ensure transport won't stay open
                this.transport.close();
                // ignore further transport communication
                this.transport.removeAllListeners();
                if (typeof removeEventListener === "function") {
                    removeEventListener("offline", this.offlineEventListener, false);
                }
                // set ready state
                this.readyState = "closed";
                // clear session id
                this.id = null;
                // emit close event
                this.emitReserved("close", reason, description);
                // clean buffers after, so users can still
                // grab the buffers on `close` event
                this.writeBuffer = [];
                this.prevBufferLen = 0;
            }
        }
        /**
         * Filters upgrades, returning only those matching client transports.
         *
         * @param {Array} server upgrades
         * @api private
         *
         */
        filterUpgrades(upgrades) {
            const filteredUpgrades = [];
            let i = 0;
            const j = upgrades.length;
            for (; i < j; i++) {
                if (~this.transports.indexOf(upgrades[i]))
                    filteredUpgrades.push(upgrades[i]);
            }
            return filteredUpgrades;
        }
    }
    Socket$1.protocol = protocol$1;

    /**
     * URL parser.
     *
     * @param uri - url
     * @param path - the request path of the connection
     * @param loc - An object meant to mimic window.location.
     *        Defaults to window.location.
     * @public
     */
    function url(uri, path = "", loc) {
        let obj = uri;
        // default to window.location
        loc = loc || (typeof location !== "undefined" && location);
        if (null == uri)
            uri = loc.protocol + "//" + loc.host;
        // relative path support
        if (typeof uri === "string") {
            if ("/" === uri.charAt(0)) {
                if ("/" === uri.charAt(1)) {
                    uri = loc.protocol + uri;
                }
                else {
                    uri = loc.host + uri;
                }
            }
            if (!/^(https?|wss?):\/\//.test(uri)) {
                if ("undefined" !== typeof loc) {
                    uri = loc.protocol + "//" + uri;
                }
                else {
                    uri = "https://" + uri;
                }
            }
            // parse
            obj = parse(uri);
        }
        // make sure we treat `localhost:80` and `localhost` equally
        if (!obj.port) {
            if (/^(http|ws)$/.test(obj.protocol)) {
                obj.port = "80";
            }
            else if (/^(http|ws)s$/.test(obj.protocol)) {
                obj.port = "443";
            }
        }
        obj.path = obj.path || "/";
        const ipv6 = obj.host.indexOf(":") !== -1;
        const host = ipv6 ? "[" + obj.host + "]" : obj.host;
        // define unique id
        obj.id = obj.protocol + "://" + host + ":" + obj.port + path;
        // define href
        obj.href =
            obj.protocol +
                "://" +
                host +
                (loc && loc.port === obj.port ? "" : ":" + obj.port);
        return obj;
    }

    const withNativeArrayBuffer = typeof ArrayBuffer === "function";
    const isView = (obj) => {
        return typeof ArrayBuffer.isView === "function"
            ? ArrayBuffer.isView(obj)
            : obj.buffer instanceof ArrayBuffer;
    };
    const toString = Object.prototype.toString;
    const withNativeBlob = typeof Blob === "function" ||
        (typeof Blob !== "undefined" &&
            toString.call(Blob) === "[object BlobConstructor]");
    const withNativeFile = typeof File === "function" ||
        (typeof File !== "undefined" &&
            toString.call(File) === "[object FileConstructor]");
    /**
     * Returns true if obj is a Buffer, an ArrayBuffer, a Blob or a File.
     *
     * @private
     */
    function isBinary(obj) {
        return ((withNativeArrayBuffer && (obj instanceof ArrayBuffer || isView(obj))) ||
            (withNativeBlob && obj instanceof Blob) ||
            (withNativeFile && obj instanceof File));
    }
    function hasBinary(obj, toJSON) {
        if (!obj || typeof obj !== "object") {
            return false;
        }
        if (Array.isArray(obj)) {
            for (let i = 0, l = obj.length; i < l; i++) {
                if (hasBinary(obj[i])) {
                    return true;
                }
            }
            return false;
        }
        if (isBinary(obj)) {
            return true;
        }
        if (obj.toJSON &&
            typeof obj.toJSON === "function" &&
            arguments.length === 1) {
            return hasBinary(obj.toJSON(), true);
        }
        for (const key in obj) {
            if (Object.prototype.hasOwnProperty.call(obj, key) && hasBinary(obj[key])) {
                return true;
            }
        }
        return false;
    }

    /**
     * Replaces every Buffer | ArrayBuffer | Blob | File in packet with a numbered placeholder.
     *
     * @param {Object} packet - socket.io event packet
     * @return {Object} with deconstructed packet and list of buffers
     * @public
     */
    function deconstructPacket(packet) {
        const buffers = [];
        const packetData = packet.data;
        const pack = packet;
        pack.data = _deconstructPacket(packetData, buffers);
        pack.attachments = buffers.length; // number of binary 'attachments'
        return { packet: pack, buffers: buffers };
    }
    function _deconstructPacket(data, buffers) {
        if (!data)
            return data;
        if (isBinary(data)) {
            const placeholder = { _placeholder: true, num: buffers.length };
            buffers.push(data);
            return placeholder;
        }
        else if (Array.isArray(data)) {
            const newData = new Array(data.length);
            for (let i = 0; i < data.length; i++) {
                newData[i] = _deconstructPacket(data[i], buffers);
            }
            return newData;
        }
        else if (typeof data === "object" && !(data instanceof Date)) {
            const newData = {};
            for (const key in data) {
                if (Object.prototype.hasOwnProperty.call(data, key)) {
                    newData[key] = _deconstructPacket(data[key], buffers);
                }
            }
            return newData;
        }
        return data;
    }
    /**
     * Reconstructs a binary packet from its placeholder packet and buffers
     *
     * @param {Object} packet - event packet with placeholders
     * @param {Array} buffers - binary buffers to put in placeholder positions
     * @return {Object} reconstructed packet
     * @public
     */
    function reconstructPacket(packet, buffers) {
        packet.data = _reconstructPacket(packet.data, buffers);
        packet.attachments = undefined; // no longer useful
        return packet;
    }
    function _reconstructPacket(data, buffers) {
        if (!data)
            return data;
        if (data && data._placeholder === true) {
            const isIndexValid = typeof data.num === "number" &&
                data.num >= 0 &&
                data.num < buffers.length;
            if (isIndexValid) {
                return buffers[data.num]; // appropriate buffer (should be natural order anyway)
            }
            else {
                throw new Error("illegal attachments");
            }
        }
        else if (Array.isArray(data)) {
            for (let i = 0; i < data.length; i++) {
                data[i] = _reconstructPacket(data[i], buffers);
            }
        }
        else if (typeof data === "object") {
            for (const key in data) {
                if (Object.prototype.hasOwnProperty.call(data, key)) {
                    data[key] = _reconstructPacket(data[key], buffers);
                }
            }
        }
        return data;
    }

    /**
     * Protocol version.
     *
     * @public
     */
    const protocol = 5;
    var PacketType;
    (function (PacketType) {
        PacketType[PacketType["CONNECT"] = 0] = "CONNECT";
        PacketType[PacketType["DISCONNECT"] = 1] = "DISCONNECT";
        PacketType[PacketType["EVENT"] = 2] = "EVENT";
        PacketType[PacketType["ACK"] = 3] = "ACK";
        PacketType[PacketType["CONNECT_ERROR"] = 4] = "CONNECT_ERROR";
        PacketType[PacketType["BINARY_EVENT"] = 5] = "BINARY_EVENT";
        PacketType[PacketType["BINARY_ACK"] = 6] = "BINARY_ACK";
    })(PacketType || (PacketType = {}));
    /**
     * A socket.io Encoder instance
     */
    class Encoder {
        /**
         * Encoder constructor
         *
         * @param {function} replacer - custom replacer to pass down to JSON.parse
         */
        constructor(replacer) {
            this.replacer = replacer;
        }
        /**
         * Encode a packet as a single string if non-binary, or as a
         * buffer sequence, depending on packet type.
         *
         * @param {Object} obj - packet object
         */
        encode(obj) {
            if (obj.type === PacketType.EVENT || obj.type === PacketType.ACK) {
                if (hasBinary(obj)) {
                    obj.type =
                        obj.type === PacketType.EVENT
                            ? PacketType.BINARY_EVENT
                            : PacketType.BINARY_ACK;
                    return this.encodeAsBinary(obj);
                }
            }
            return [this.encodeAsString(obj)];
        }
        /**
         * Encode packet as string.
         */
        encodeAsString(obj) {
            // first is type
            let str = "" + obj.type;
            // attachments if we have them
            if (obj.type === PacketType.BINARY_EVENT ||
                obj.type === PacketType.BINARY_ACK) {
                str += obj.attachments + "-";
            }
            // if we have a namespace other than `/`
            // we append it followed by a comma `,`
            if (obj.nsp && "/" !== obj.nsp) {
                str += obj.nsp + ",";
            }
            // immediately followed by the id
            if (null != obj.id) {
                str += obj.id;
            }
            // json data
            if (null != obj.data) {
                str += JSON.stringify(obj.data, this.replacer);
            }
            return str;
        }
        /**
         * Encode packet as 'buffer sequence' by removing blobs, and
         * deconstructing packet into object with placeholders and
         * a list of buffers.
         */
        encodeAsBinary(obj) {
            const deconstruction = deconstructPacket(obj);
            const pack = this.encodeAsString(deconstruction.packet);
            const buffers = deconstruction.buffers;
            buffers.unshift(pack); // add packet info to beginning of data list
            return buffers; // write all the buffers
        }
    }
    /**
     * A socket.io Decoder instance
     *
     * @return {Object} decoder
     */
    class Decoder extends Emitter {
        /**
         * Decoder constructor
         *
         * @param {function} reviver - custom reviver to pass down to JSON.stringify
         */
        constructor(reviver) {
            super();
            this.reviver = reviver;
        }
        /**
         * Decodes an encoded packet string into packet JSON.
         *
         * @param {String} obj - encoded packet
         */
        add(obj) {
            let packet;
            if (typeof obj === "string") {
                if (this.reconstructor) {
                    throw new Error("got plaintext data when reconstructing a packet");
                }
                packet = this.decodeString(obj);
                if (packet.type === PacketType.BINARY_EVENT ||
                    packet.type === PacketType.BINARY_ACK) {
                    // binary packet's json
                    this.reconstructor = new BinaryReconstructor(packet);
                    // no attachments, labeled binary but no binary data to follow
                    if (packet.attachments === 0) {
                        super.emitReserved("decoded", packet);
                    }
                }
                else {
                    // non-binary full packet
                    super.emitReserved("decoded", packet);
                }
            }
            else if (isBinary(obj) || obj.base64) {
                // raw binary data
                if (!this.reconstructor) {
                    throw new Error("got binary data when not reconstructing a packet");
                }
                else {
                    packet = this.reconstructor.takeBinaryData(obj);
                    if (packet) {
                        // received final buffer
                        this.reconstructor = null;
                        super.emitReserved("decoded", packet);
                    }
                }
            }
            else {
                throw new Error("Unknown type: " + obj);
            }
        }
        /**
         * Decode a packet String (JSON data)
         *
         * @param {String} str
         * @return {Object} packet
         */
        decodeString(str) {
            let i = 0;
            // look up type
            const p = {
                type: Number(str.charAt(0)),
            };
            if (PacketType[p.type] === undefined) {
                throw new Error("unknown packet type " + p.type);
            }
            // look up attachments if type binary
            if (p.type === PacketType.BINARY_EVENT ||
                p.type === PacketType.BINARY_ACK) {
                const start = i + 1;
                while (str.charAt(++i) !== "-" && i != str.length) { }
                const buf = str.substring(start, i);
                if (buf != Number(buf) || str.charAt(i) !== "-") {
                    throw new Error("Illegal attachments");
                }
                p.attachments = Number(buf);
            }
            // look up namespace (if any)
            if ("/" === str.charAt(i + 1)) {
                const start = i + 1;
                while (++i) {
                    const c = str.charAt(i);
                    if ("," === c)
                        break;
                    if (i === str.length)
                        break;
                }
                p.nsp = str.substring(start, i);
            }
            else {
                p.nsp = "/";
            }
            // look up id
            const next = str.charAt(i + 1);
            if ("" !== next && Number(next) == next) {
                const start = i + 1;
                while (++i) {
                    const c = str.charAt(i);
                    if (null == c || Number(c) != c) {
                        --i;
                        break;
                    }
                    if (i === str.length)
                        break;
                }
                p.id = Number(str.substring(start, i + 1));
            }
            // look up json data
            if (str.charAt(++i)) {
                const payload = this.tryParse(str.substr(i));
                if (Decoder.isPayloadValid(p.type, payload)) {
                    p.data = payload;
                }
                else {
                    throw new Error("invalid payload");
                }
            }
            return p;
        }
        tryParse(str) {
            try {
                return JSON.parse(str, this.reviver);
            }
            catch (e) {
                return false;
            }
        }
        static isPayloadValid(type, payload) {
            switch (type) {
                case PacketType.CONNECT:
                    return typeof payload === "object";
                case PacketType.DISCONNECT:
                    return payload === undefined;
                case PacketType.CONNECT_ERROR:
                    return typeof payload === "string" || typeof payload === "object";
                case PacketType.EVENT:
                case PacketType.BINARY_EVENT:
                    return Array.isArray(payload) && payload.length > 0;
                case PacketType.ACK:
                case PacketType.BINARY_ACK:
                    return Array.isArray(payload);
            }
        }
        /**
         * Deallocates a parser's resources
         */
        destroy() {
            if (this.reconstructor) {
                this.reconstructor.finishedReconstruction();
            }
        }
    }
    /**
     * A manager of a binary event's 'buffer sequence'. Should
     * be constructed whenever a packet of type BINARY_EVENT is
     * decoded.
     *
     * @param {Object} packet
     * @return {BinaryReconstructor} initialized reconstructor
     */
    class BinaryReconstructor {
        constructor(packet) {
            this.packet = packet;
            this.buffers = [];
            this.reconPack = packet;
        }
        /**
         * Method to be called when binary data received from connection
         * after a BINARY_EVENT packet.
         *
         * @param {Buffer | ArrayBuffer} binData - the raw binary data received
         * @return {null | Object} returns null if more binary data is expected or
         *   a reconstructed packet object if all buffers have been received.
         */
        takeBinaryData(binData) {
            this.buffers.push(binData);
            if (this.buffers.length === this.reconPack.attachments) {
                // done with buffer list
                const packet = reconstructPacket(this.reconPack, this.buffers);
                this.finishedReconstruction();
                return packet;
            }
            return null;
        }
        /**
         * Cleans up binary packet reconstruction variables.
         */
        finishedReconstruction() {
            this.reconPack = null;
            this.buffers = [];
        }
    }

    var parser = /*#__PURE__*/Object.freeze({
        __proto__: null,
        protocol: protocol,
        get PacketType () { return PacketType; },
        Encoder: Encoder,
        Decoder: Decoder
    });

    function on(obj, ev, fn) {
        obj.on(ev, fn);
        return function subDestroy() {
            obj.off(ev, fn);
        };
    }

    /**
     * Internal events.
     * These events can't be emitted by the user.
     */
    const RESERVED_EVENTS = Object.freeze({
        connect: 1,
        connect_error: 1,
        disconnect: 1,
        disconnecting: 1,
        // EventEmitter reserved events: https://nodejs.org/api/events.html#events_event_newlistener
        newListener: 1,
        removeListener: 1,
    });
    class Socket extends Emitter {
        /**
         * `Socket` constructor.
         *
         * @public
         */
        constructor(io, nsp, opts) {
            super();
            this.connected = false;
            this.receiveBuffer = [];
            this.sendBuffer = [];
            this.ids = 0;
            this.acks = {};
            this.flags = {};
            this.io = io;
            this.nsp = nsp;
            if (opts && opts.auth) {
                this.auth = opts.auth;
            }
            if (this.io._autoConnect)
                this.open();
        }
        /**
         * Whether the socket is currently disconnected
         */
        get disconnected() {
            return !this.connected;
        }
        /**
         * Subscribe to open, close and packet events
         *
         * @private
         */
        subEvents() {
            if (this.subs)
                return;
            const io = this.io;
            this.subs = [
                on(io, "open", this.onopen.bind(this)),
                on(io, "packet", this.onpacket.bind(this)),
                on(io, "error", this.onerror.bind(this)),
                on(io, "close", this.onclose.bind(this)),
            ];
        }
        /**
         * Whether the Socket will try to reconnect when its Manager connects or reconnects
         */
        get active() {
            return !!this.subs;
        }
        /**
         * "Opens" the socket.
         *
         * @public
         */
        connect() {
            if (this.connected)
                return this;
            this.subEvents();
            if (!this.io["_reconnecting"])
                this.io.open(); // ensure open
            if ("open" === this.io._readyState)
                this.onopen();
            return this;
        }
        /**
         * Alias for connect()
         */
        open() {
            return this.connect();
        }
        /**
         * Sends a `message` event.
         *
         * @return self
         * @public
         */
        send(...args) {
            args.unshift("message");
            this.emit.apply(this, args);
            return this;
        }
        /**
         * Override `emit`.
         * If the event is in `events`, it's emitted normally.
         *
         * @return self
         * @public
         */
        emit(ev, ...args) {
            if (RESERVED_EVENTS.hasOwnProperty(ev)) {
                throw new Error('"' + ev + '" is a reserved event name');
            }
            args.unshift(ev);
            const packet = {
                type: PacketType.EVENT,
                data: args,
            };
            packet.options = {};
            packet.options.compress = this.flags.compress !== false;
            // event ack callback
            if ("function" === typeof args[args.length - 1]) {
                const id = this.ids++;
                const ack = args.pop();
                this._registerAckCallback(id, ack);
                packet.id = id;
            }
            const isTransportWritable = this.io.engine &&
                this.io.engine.transport &&
                this.io.engine.transport.writable;
            const discardPacket = this.flags.volatile && (!isTransportWritable || !this.connected);
            if (discardPacket) ;
            else if (this.connected) {
                this.notifyOutgoingListeners(packet);
                this.packet(packet);
            }
            else {
                this.sendBuffer.push(packet);
            }
            this.flags = {};
            return this;
        }
        /**
         * @private
         */
        _registerAckCallback(id, ack) {
            const timeout = this.flags.timeout;
            if (timeout === undefined) {
                this.acks[id] = ack;
                return;
            }
            // @ts-ignore
            const timer = this.io.setTimeoutFn(() => {
                delete this.acks[id];
                for (let i = 0; i < this.sendBuffer.length; i++) {
                    if (this.sendBuffer[i].id === id) {
                        this.sendBuffer.splice(i, 1);
                    }
                }
                ack.call(this, new Error("operation has timed out"));
            }, timeout);
            this.acks[id] = (...args) => {
                // @ts-ignore
                this.io.clearTimeoutFn(timer);
                ack.apply(this, [null, ...args]);
            };
        }
        /**
         * Sends a packet.
         *
         * @param packet
         * @private
         */
        packet(packet) {
            packet.nsp = this.nsp;
            this.io._packet(packet);
        }
        /**
         * Called upon engine `open`.
         *
         * @private
         */
        onopen() {
            if (typeof this.auth == "function") {
                this.auth((data) => {
                    this.packet({ type: PacketType.CONNECT, data });
                });
            }
            else {
                this.packet({ type: PacketType.CONNECT, data: this.auth });
            }
        }
        /**
         * Called upon engine or manager `error`.
         *
         * @param err
         * @private
         */
        onerror(err) {
            if (!this.connected) {
                this.emitReserved("connect_error", err);
            }
        }
        /**
         * Called upon engine `close`.
         *
         * @param reason
         * @param description
         * @private
         */
        onclose(reason, description) {
            this.connected = false;
            delete this.id;
            this.emitReserved("disconnect", reason, description);
        }
        /**
         * Called with socket packet.
         *
         * @param packet
         * @private
         */
        onpacket(packet) {
            const sameNamespace = packet.nsp === this.nsp;
            if (!sameNamespace)
                return;
            switch (packet.type) {
                case PacketType.CONNECT:
                    if (packet.data && packet.data.sid) {
                        const id = packet.data.sid;
                        this.onconnect(id);
                    }
                    else {
                        this.emitReserved("connect_error", new Error("It seems you are trying to reach a Socket.IO server in v2.x with a v3.x client, but they are not compatible (more information here: https://socket.io/docs/v3/migrating-from-2-x-to-3-0/)"));
                    }
                    break;
                case PacketType.EVENT:
                case PacketType.BINARY_EVENT:
                    this.onevent(packet);
                    break;
                case PacketType.ACK:
                case PacketType.BINARY_ACK:
                    this.onack(packet);
                    break;
                case PacketType.DISCONNECT:
                    this.ondisconnect();
                    break;
                case PacketType.CONNECT_ERROR:
                    this.destroy();
                    const err = new Error(packet.data.message);
                    // @ts-ignore
                    err.data = packet.data.data;
                    this.emitReserved("connect_error", err);
                    break;
            }
        }
        /**
         * Called upon a server event.
         *
         * @param packet
         * @private
         */
        onevent(packet) {
            const args = packet.data || [];
            if (null != packet.id) {
                args.push(this.ack(packet.id));
            }
            if (this.connected) {
                this.emitEvent(args);
            }
            else {
                this.receiveBuffer.push(Object.freeze(args));
            }
        }
        emitEvent(args) {
            if (this._anyListeners && this._anyListeners.length) {
                const listeners = this._anyListeners.slice();
                for (const listener of listeners) {
                    listener.apply(this, args);
                }
            }
            super.emit.apply(this, args);
        }
        /**
         * Produces an ack callback to emit with an event.
         *
         * @private
         */
        ack(id) {
            const self = this;
            let sent = false;
            return function (...args) {
                // prevent double callbacks
                if (sent)
                    return;
                sent = true;
                self.packet({
                    type: PacketType.ACK,
                    id: id,
                    data: args,
                });
            };
        }
        /**
         * Called upon a server acknowlegement.
         *
         * @param packet
         * @private
         */
        onack(packet) {
            const ack = this.acks[packet.id];
            if ("function" === typeof ack) {
                ack.apply(this, packet.data);
                delete this.acks[packet.id];
            }
        }
        /**
         * Called upon server connect.
         *
         * @private
         */
        onconnect(id) {
            this.id = id;
            this.connected = true;
            this.emitBuffered();
            this.emitReserved("connect");
        }
        /**
         * Emit buffered events (received and emitted).
         *
         * @private
         */
        emitBuffered() {
            this.receiveBuffer.forEach((args) => this.emitEvent(args));
            this.receiveBuffer = [];
            this.sendBuffer.forEach((packet) => {
                this.notifyOutgoingListeners(packet);
                this.packet(packet);
            });
            this.sendBuffer = [];
        }
        /**
         * Called upon server disconnect.
         *
         * @private
         */
        ondisconnect() {
            this.destroy();
            this.onclose("io server disconnect");
        }
        /**
         * Called upon forced client/server side disconnections,
         * this method ensures the manager stops tracking us and
         * that reconnections don't get triggered for this.
         *
         * @private
         */
        destroy() {
            if (this.subs) {
                // clean subscriptions to avoid reconnections
                this.subs.forEach((subDestroy) => subDestroy());
                this.subs = undefined;
            }
            this.io["_destroy"](this);
        }
        /**
         * Disconnects the socket manually.
         *
         * @return self
         * @public
         */
        disconnect() {
            if (this.connected) {
                this.packet({ type: PacketType.DISCONNECT });
            }
            // remove socket from pool
            this.destroy();
            if (this.connected) {
                // fire events
                this.onclose("io client disconnect");
            }
            return this;
        }
        /**
         * Alias for disconnect()
         *
         * @return self
         * @public
         */
        close() {
            return this.disconnect();
        }
        /**
         * Sets the compress flag.
         *
         * @param compress - if `true`, compresses the sending data
         * @return self
         * @public
         */
        compress(compress) {
            this.flags.compress = compress;
            return this;
        }
        /**
         * Sets a modifier for a subsequent event emission that the event message will be dropped when this socket is not
         * ready to send messages.
         *
         * @returns self
         * @public
         */
        get volatile() {
            this.flags.volatile = true;
            return this;
        }
        /**
         * Sets a modifier for a subsequent event emission that the callback will be called with an error when the
         * given number of milliseconds have elapsed without an acknowledgement from the server:
         *
         * ```
         * socket.timeout(5000).emit("my-event", (err) => {
         *   if (err) {
         *     // the server did not acknowledge the event in the given delay
         *   }
         * });
         * ```
         *
         * @returns self
         * @public
         */
        timeout(timeout) {
            this.flags.timeout = timeout;
            return this;
        }
        /**
         * Adds a listener that will be fired when any event is emitted. The event name is passed as the first argument to the
         * callback.
         *
         * @param listener
         * @public
         */
        onAny(listener) {
            this._anyListeners = this._anyListeners || [];
            this._anyListeners.push(listener);
            return this;
        }
        /**
         * Adds a listener that will be fired when any event is emitted. The event name is passed as the first argument to the
         * callback. The listener is added to the beginning of the listeners array.
         *
         * @param listener
         * @public
         */
        prependAny(listener) {
            this._anyListeners = this._anyListeners || [];
            this._anyListeners.unshift(listener);
            return this;
        }
        /**
         * Removes the listener that will be fired when any event is emitted.
         *
         * @param listener
         * @public
         */
        offAny(listener) {
            if (!this._anyListeners) {
                return this;
            }
            if (listener) {
                const listeners = this._anyListeners;
                for (let i = 0; i < listeners.length; i++) {
                    if (listener === listeners[i]) {
                        listeners.splice(i, 1);
                        return this;
                    }
                }
            }
            else {
                this._anyListeners = [];
            }
            return this;
        }
        /**
         * Returns an array of listeners that are listening for any event that is specified. This array can be manipulated,
         * e.g. to remove listeners.
         *
         * @public
         */
        listenersAny() {
            return this._anyListeners || [];
        }
        /**
         * Adds a listener that will be fired when any event is emitted. The event name is passed as the first argument to the
         * callback.
         *
         * @param listener
         *
         * <pre><code>
         *
         * socket.onAnyOutgoing((event, ...args) => {
         *   console.log(event);
         * });
         *
         * </pre></code>
         *
         * @public
         */
        onAnyOutgoing(listener) {
            this._anyOutgoingListeners = this._anyOutgoingListeners || [];
            this._anyOutgoingListeners.push(listener);
            return this;
        }
        /**
         * Adds a listener that will be fired when any event is emitted. The event name is passed as the first argument to the
         * callback. The listener is added to the beginning of the listeners array.
         *
         * @param listener
         *
         * <pre><code>
         *
         * socket.prependAnyOutgoing((event, ...args) => {
         *   console.log(event);
         * });
         *
         * </pre></code>
         *
         * @public
         */
        prependAnyOutgoing(listener) {
            this._anyOutgoingListeners = this._anyOutgoingListeners || [];
            this._anyOutgoingListeners.unshift(listener);
            return this;
        }
        /**
         * Removes the listener that will be fired when any event is emitted.
         *
         * @param listener
         *
         * <pre><code>
         *
         * const handler = (event, ...args) => {
         *   console.log(event);
         * }
         *
         * socket.onAnyOutgoing(handler);
         *
         * // then later
         * socket.offAnyOutgoing(handler);
         *
         * </pre></code>
         *
         * @public
         */
        offAnyOutgoing(listener) {
            if (!this._anyOutgoingListeners) {
                return this;
            }
            if (listener) {
                const listeners = this._anyOutgoingListeners;
                for (let i = 0; i < listeners.length; i++) {
                    if (listener === listeners[i]) {
                        listeners.splice(i, 1);
                        return this;
                    }
                }
            }
            else {
                this._anyOutgoingListeners = [];
            }
            return this;
        }
        /**
         * Returns an array of listeners that are listening for any event that is specified. This array can be manipulated,
         * e.g. to remove listeners.
         *
         * @public
         */
        listenersAnyOutgoing() {
            return this._anyOutgoingListeners || [];
        }
        /**
         * Notify the listeners for each packet sent
         *
         * @param packet
         *
         * @private
         */
        notifyOutgoingListeners(packet) {
            if (this._anyOutgoingListeners && this._anyOutgoingListeners.length) {
                const listeners = this._anyOutgoingListeners.slice();
                for (const listener of listeners) {
                    listener.apply(this, packet.data);
                }
            }
        }
    }

    /**
     * Initialize backoff timer with `opts`.
     *
     * - `min` initial timeout in milliseconds [100]
     * - `max` max timeout [10000]
     * - `jitter` [0]
     * - `factor` [2]
     *
     * @param {Object} opts
     * @api public
     */
    function Backoff(opts) {
        opts = opts || {};
        this.ms = opts.min || 100;
        this.max = opts.max || 10000;
        this.factor = opts.factor || 2;
        this.jitter = opts.jitter > 0 && opts.jitter <= 1 ? opts.jitter : 0;
        this.attempts = 0;
    }
    /**
     * Return the backoff duration.
     *
     * @return {Number}
     * @api public
     */
    Backoff.prototype.duration = function () {
        var ms = this.ms * Math.pow(this.factor, this.attempts++);
        if (this.jitter) {
            var rand = Math.random();
            var deviation = Math.floor(rand * this.jitter * ms);
            ms = (Math.floor(rand * 10) & 1) == 0 ? ms - deviation : ms + deviation;
        }
        return Math.min(ms, this.max) | 0;
    };
    /**
     * Reset the number of attempts.
     *
     * @api public
     */
    Backoff.prototype.reset = function () {
        this.attempts = 0;
    };
    /**
     * Set the minimum duration
     *
     * @api public
     */
    Backoff.prototype.setMin = function (min) {
        this.ms = min;
    };
    /**
     * Set the maximum duration
     *
     * @api public
     */
    Backoff.prototype.setMax = function (max) {
        this.max = max;
    };
    /**
     * Set the jitter
     *
     * @api public
     */
    Backoff.prototype.setJitter = function (jitter) {
        this.jitter = jitter;
    };

    class Manager extends Emitter {
        constructor(uri, opts) {
            var _a;
            super();
            this.nsps = {};
            this.subs = [];
            if (uri && "object" === typeof uri) {
                opts = uri;
                uri = undefined;
            }
            opts = opts || {};
            opts.path = opts.path || "/socket.io";
            this.opts = opts;
            installTimerFunctions(this, opts);
            this.reconnection(opts.reconnection !== false);
            this.reconnectionAttempts(opts.reconnectionAttempts || Infinity);
            this.reconnectionDelay(opts.reconnectionDelay || 1000);
            this.reconnectionDelayMax(opts.reconnectionDelayMax || 5000);
            this.randomizationFactor((_a = opts.randomizationFactor) !== null && _a !== void 0 ? _a : 0.5);
            this.backoff = new Backoff({
                min: this.reconnectionDelay(),
                max: this.reconnectionDelayMax(),
                jitter: this.randomizationFactor(),
            });
            this.timeout(null == opts.timeout ? 20000 : opts.timeout);
            this._readyState = "closed";
            this.uri = uri;
            const _parser = opts.parser || parser;
            this.encoder = new _parser.Encoder();
            this.decoder = new _parser.Decoder();
            this._autoConnect = opts.autoConnect !== false;
            if (this._autoConnect)
                this.open();
        }
        reconnection(v) {
            if (!arguments.length)
                return this._reconnection;
            this._reconnection = !!v;
            return this;
        }
        reconnectionAttempts(v) {
            if (v === undefined)
                return this._reconnectionAttempts;
            this._reconnectionAttempts = v;
            return this;
        }
        reconnectionDelay(v) {
            var _a;
            if (v === undefined)
                return this._reconnectionDelay;
            this._reconnectionDelay = v;
            (_a = this.backoff) === null || _a === void 0 ? void 0 : _a.setMin(v);
            return this;
        }
        randomizationFactor(v) {
            var _a;
            if (v === undefined)
                return this._randomizationFactor;
            this._randomizationFactor = v;
            (_a = this.backoff) === null || _a === void 0 ? void 0 : _a.setJitter(v);
            return this;
        }
        reconnectionDelayMax(v) {
            var _a;
            if (v === undefined)
                return this._reconnectionDelayMax;
            this._reconnectionDelayMax = v;
            (_a = this.backoff) === null || _a === void 0 ? void 0 : _a.setMax(v);
            return this;
        }
        timeout(v) {
            if (!arguments.length)
                return this._timeout;
            this._timeout = v;
            return this;
        }
        /**
         * Starts trying to reconnect if reconnection is enabled and we have not
         * started reconnecting yet
         *
         * @private
         */
        maybeReconnectOnOpen() {
            // Only try to reconnect if it's the first time we're connecting
            if (!this._reconnecting &&
                this._reconnection &&
                this.backoff.attempts === 0) {
                // keeps reconnection from firing twice for the same reconnection loop
                this.reconnect();
            }
        }
        /**
         * Sets the current transport `socket`.
         *
         * @param {Function} fn - optional, callback
         * @return self
         * @public
         */
        open(fn) {
            if (~this._readyState.indexOf("open"))
                return this;
            this.engine = new Socket$1(this.uri, this.opts);
            const socket = this.engine;
            const self = this;
            this._readyState = "opening";
            this.skipReconnect = false;
            // emit `open`
            const openSubDestroy = on(socket, "open", function () {
                self.onopen();
                fn && fn();
            });
            // emit `error`
            const errorSub = on(socket, "error", (err) => {
                self.cleanup();
                self._readyState = "closed";
                this.emitReserved("error", err);
                if (fn) {
                    fn(err);
                }
                else {
                    // Only do this if there is no fn to handle the error
                    self.maybeReconnectOnOpen();
                }
            });
            if (false !== this._timeout) {
                const timeout = this._timeout;
                if (timeout === 0) {
                    openSubDestroy(); // prevents a race condition with the 'open' event
                }
                // set timer
                const timer = this.setTimeoutFn(() => {
                    openSubDestroy();
                    socket.close();
                    // @ts-ignore
                    socket.emit("error", new Error("timeout"));
                }, timeout);
                if (this.opts.autoUnref) {
                    timer.unref();
                }
                this.subs.push(function subDestroy() {
                    clearTimeout(timer);
                });
            }
            this.subs.push(openSubDestroy);
            this.subs.push(errorSub);
            return this;
        }
        /**
         * Alias for open()
         *
         * @return self
         * @public
         */
        connect(fn) {
            return this.open(fn);
        }
        /**
         * Called upon transport open.
         *
         * @private
         */
        onopen() {
            // clear old subs
            this.cleanup();
            // mark as open
            this._readyState = "open";
            this.emitReserved("open");
            // add new subs
            const socket = this.engine;
            this.subs.push(on(socket, "ping", this.onping.bind(this)), on(socket, "data", this.ondata.bind(this)), on(socket, "error", this.onerror.bind(this)), on(socket, "close", this.onclose.bind(this)), on(this.decoder, "decoded", this.ondecoded.bind(this)));
        }
        /**
         * Called upon a ping.
         *
         * @private
         */
        onping() {
            this.emitReserved("ping");
        }
        /**
         * Called with data.
         *
         * @private
         */
        ondata(data) {
            this.decoder.add(data);
        }
        /**
         * Called when parser fully decodes a packet.
         *
         * @private
         */
        ondecoded(packet) {
            this.emitReserved("packet", packet);
        }
        /**
         * Called upon socket error.
         *
         * @private
         */
        onerror(err) {
            this.emitReserved("error", err);
        }
        /**
         * Creates a new socket for the given `nsp`.
         *
         * @return {Socket}
         * @public
         */
        socket(nsp, opts) {
            let socket = this.nsps[nsp];
            if (!socket) {
                socket = new Socket(this, nsp, opts);
                this.nsps[nsp] = socket;
            }
            return socket;
        }
        /**
         * Called upon a socket close.
         *
         * @param socket
         * @private
         */
        _destroy(socket) {
            const nsps = Object.keys(this.nsps);
            for (const nsp of nsps) {
                const socket = this.nsps[nsp];
                if (socket.active) {
                    return;
                }
            }
            this._close();
        }
        /**
         * Writes a packet.
         *
         * @param packet
         * @private
         */
        _packet(packet) {
            const encodedPackets = this.encoder.encode(packet);
            for (let i = 0; i < encodedPackets.length; i++) {
                this.engine.write(encodedPackets[i], packet.options);
            }
        }
        /**
         * Clean up transport subscriptions and packet buffer.
         *
         * @private
         */
        cleanup() {
            this.subs.forEach((subDestroy) => subDestroy());
            this.subs.length = 0;
            this.decoder.destroy();
        }
        /**
         * Close the current socket.
         *
         * @private
         */
        _close() {
            this.skipReconnect = true;
            this._reconnecting = false;
            this.onclose("forced close");
            if (this.engine)
                this.engine.close();
        }
        /**
         * Alias for close()
         *
         * @private
         */
        disconnect() {
            return this._close();
        }
        /**
         * Called upon engine close.
         *
         * @private
         */
        onclose(reason, description) {
            this.cleanup();
            this.backoff.reset();
            this._readyState = "closed";
            this.emitReserved("close", reason, description);
            if (this._reconnection && !this.skipReconnect) {
                this.reconnect();
            }
        }
        /**
         * Attempt a reconnection.
         *
         * @private
         */
        reconnect() {
            if (this._reconnecting || this.skipReconnect)
                return this;
            const self = this;
            if (this.backoff.attempts >= this._reconnectionAttempts) {
                this.backoff.reset();
                this.emitReserved("reconnect_failed");
                this._reconnecting = false;
            }
            else {
                const delay = this.backoff.duration();
                this._reconnecting = true;
                const timer = this.setTimeoutFn(() => {
                    if (self.skipReconnect)
                        return;
                    this.emitReserved("reconnect_attempt", self.backoff.attempts);
                    // check again for the case socket closed in above events
                    if (self.skipReconnect)
                        return;
                    self.open((err) => {
                        if (err) {
                            self._reconnecting = false;
                            self.reconnect();
                            this.emitReserved("reconnect_error", err);
                        }
                        else {
                            self.onreconnect();
                        }
                    });
                }, delay);
                if (this.opts.autoUnref) {
                    timer.unref();
                }
                this.subs.push(function subDestroy() {
                    clearTimeout(timer);
                });
            }
        }
        /**
         * Called upon successful reconnect.
         *
         * @private
         */
        onreconnect() {
            const attempt = this.backoff.attempts;
            this._reconnecting = false;
            this.backoff.reset();
            this.emitReserved("reconnect", attempt);
        }
    }

    /**
     * Managers cache.
     */
    const cache = {};
    function lookup(uri, opts) {
        if (typeof uri === "object") {
            opts = uri;
            uri = undefined;
        }
        opts = opts || {};
        const parsed = url(uri, opts.path || "/socket.io");
        const source = parsed.source;
        const id = parsed.id;
        const path = parsed.path;
        const sameNamespace = cache[id] && path in cache[id]["nsps"];
        const newConnection = opts.forceNew ||
            opts["force new connection"] ||
            false === opts.multiplex ||
            sameNamespace;
        let io;
        if (newConnection) {
            io = new Manager(source, opts);
        }
        else {
            if (!cache[id]) {
                cache[id] = new Manager(source, opts);
            }
            io = cache[id];
        }
        if (parsed.query && !opts.query) {
            opts.query = parsed.queryKey;
        }
        return io.socket(parsed.path, opts);
    }
    // so that "lookup" can be used both as a function (e.g. `io(...)`) and as a
    // namespace (e.g. `io.connect(...)`), for backward compatibility
    Object.assign(lookup, {
        Manager,
        Socket,
        io: lookup,
        connect: lookup,
    });

    const setObject = function (key, value) {
        localStorage.setItem(key, JSON.stringify(value));
    };

    const getObject = function (key) {
        let value = localStorage.getItem(key);
        if (value === "undefined") return {};
        try {
            value = JSON.parse(value);
        } catch (err) {
            console.log(err);
        }
        return value;
    };

    const initConfig = {
      order: {
        Content: "",
        Mangas: "",
        Videos: "'",
      },
      items: 0,
    };

    const PageConfig = writable(getObject("config") || initConfig);

    const updateConfig = async (config) => {
      PageConfig.update((cfg) => (config));
      setObject("config", config);
      return config;
    };

    /* src\ShareComponent\Config.svelte generated by Svelte v3.49.0 */

    function create_if_block$k(ctx) {
    	let div5;
    	let div1;
    	let div0;
    	let t1;
    	let select;
    	let option0;
    	let option1;
    	let option2;
    	let option3;
    	let t6;
    	let div3;
    	let div2;
    	let t8;
    	let input;
    	let t9;
    	let span0;
    	let t11;
    	let div4;
    	let span1;
    	let mounted;
    	let dispose;

    	return {
    		c() {
    			div5 = element("div");
    			div1 = element("div");
    			div0 = element("div");
    			div0.innerHTML = `<label for="orderby" class="input-group-text svelte-1kmdy4">Sort By:</label>`;
    			t1 = space();
    			select = element("select");
    			option0 = element("option");
    			option0.textContent = " Name";
    			option1 = element("option");
    			option1.textContent = " Name";
    			option2 = element("option");
    			option2.textContent = " Date";
    			option3 = element("option");
    			option3.textContent = " Date";
    			t6 = space();
    			div3 = element("div");
    			div2 = element("div");
    			div2.innerHTML = `<label for="items" class="input-group-text svelte-1kmdy4">File per Page:</label>`;
    			t8 = space();
    			input = element("input");
    			t9 = space();
    			span0 = element("span");
    			span0.textContent = "0 = auto, max 500";
    			t11 = space();
    			div4 = element("div");
    			span1 = element("span");
    			span1.textContent = "Save";
    			attr(div0, "class", "input-group-prepend svelte-1kmdy4");
    			option0.__value = "nu";
    			option0.value = option0.__value;
    			attr(option0, "class", "svelte-1kmdy4");
    			option1.__value = "nd";
    			option1.value = option1.__value;
    			attr(option1, "class", "svelte-1kmdy4");
    			option2.__value = "du";
    			option2.value = option2.__value;
    			attr(option2, "class", "svelte-1kmdy4");
    			option3.__value = "dd";
    			option3.value = option3.__value;
    			attr(option3, "class", "svelte-1kmdy4");
    			attr(select, "id", "orderby");
    			attr(select, "class", "form-control fa svelte-1kmdy4");
    			if (/*Config*/ ctx[1].order[document.title.split(" ")[0]] === void 0) add_render_callback(() => /*select_change_handler*/ ctx[4].call(select));
    			attr(div1, "class", "input-group svelte-1kmdy4");
    			attr(div2, "class", "input-group-prepend svelte-1kmdy4");
    			attr(input, "id", "items");
    			attr(input, "type", "number");
    			attr(input, "min", "0");
    			attr(input, "max", "500");
    			attr(input, "class", "form-control svelte-1kmdy4");
    			attr(span0, "id", "fpp-tips");
    			attr(span0, "class", "svelte-1kmdy4");
    			attr(div3, "class", "input-group svelte-1kmdy4");
    			attr(span1, "id", "btn-save");
    			attr(span1, "class", "btn svelte-1kmdy4");
    			attr(div4, "class", "bottom-controls svelte-1kmdy4");
    			attr(div5, "id", "config-content");
    			attr(div5, "class", "svelte-1kmdy4");
    		},
    		m(target, anchor) {
    			insert(target, div5, anchor);
    			append(div5, div1);
    			append(div1, div0);
    			append(div1, t1);
    			append(div1, select);
    			append(select, option0);
    			append(select, option1);
    			append(select, option2);
    			append(select, option3);
    			select_option(select, /*Config*/ ctx[1].order[document.title.split(" ")[0]]);
    			append(div5, t6);
    			append(div5, div3);
    			append(div3, div2);
    			append(div3, t8);
    			append(div3, input);
    			set_input_value(input, /*Config*/ ctx[1].items);
    			append(div3, t9);
    			append(div3, span0);
    			append(div5, t11);
    			append(div5, div4);
    			append(div4, span1);

    			if (!mounted) {
    				dispose = [
    					listen(select, "change", /*select_change_handler*/ ctx[4]),
    					listen(input, "input", /*input_input_handler*/ ctx[5]),
    					listen(span1, "click", /*applyChanges*/ ctx[2])
    				];

    				mounted = true;
    			}
    		},
    		p(ctx, dirty) {
    			if (dirty & /*Config, document*/ 2) {
    				select_option(select, /*Config*/ ctx[1].order[document.title.split(" ")[0]]);
    			}

    			if (dirty & /*Config*/ 2 && to_number(input.value) !== /*Config*/ ctx[1].items) {
    				set_input_value(input, /*Config*/ ctx[1].items);
    			}
    		},
    		d(detaching) {
    			if (detaching) detach(div5);
    			mounted = false;
    			run_all(dispose);
    		}
    	};
    }

    function create_fragment$y(ctx) {
    	let label;
    	let i0;
    	let t0;
    	let span0;
    	let t1_value = /*User*/ ctx[0].username + "";
    	let t1;
    	let label_class_value;
    	let t2;
    	let input;
    	let t3;
    	let div1;
    	let div0;
    	let span1;
    	let t5;
    	let show_if = !/*User*/ ctx[0].role.includes("Administrator");
    	let div1_class_value;
    	let mounted;
    	let dispose;
    	let if_block = show_if && create_if_block$k(ctx);

    	return {
    		c() {
    			label = element("label");
    			i0 = element("i");
    			t0 = space();
    			span0 = element("span");
    			t1 = text(t1_value);
    			t2 = space();
    			input = element("input");
    			t3 = space();
    			div1 = element("div");
    			div0 = element("div");
    			span1 = element("span");
    			span1.innerHTML = `<i class="fas fa-sign-out-alt"></i> Log out`;
    			t5 = space();
    			if (if_block) if_block.c();
    			attr(i0, "class", "fas fa-user-cog");
    			attr(span0, "class", "nav-title svelte-1kmdy4");
    			attr(label, "id", "user-label");
    			attr(label, "class", label_class_value = "" + (null_to_empty(/*User*/ ctx[0].role) + " svelte-1kmdy4"));
    			attr(label, "for", "show-config");
    			attr(input, "type", "checkbox");
    			attr(input, "name", "");
    			attr(input, "id", "show-config");
    			attr(input, "class", "svelte-1kmdy4");
    			attr(span1, "class", "svelte-1kmdy4");
    			attr(div0, "id", "sep");
    			attr(div0, "class", "svelte-1kmdy4");
    			attr(div1, "id", "user-config");

    			attr(div1, "class", div1_class_value = "" + (null_to_empty(/*User*/ ctx[0].role.includes("User")
    			? "user-config"
    			: "admin-config") + " svelte-1kmdy4"));
    		},
    		m(target, anchor) {
    			insert(target, label, anchor);
    			append(label, i0);
    			append(label, t0);
    			append(label, span0);
    			append(span0, t1);
    			insert(target, t2, anchor);
    			insert(target, input, anchor);
    			insert(target, t3, anchor);
    			insert(target, div1, anchor);
    			append(div1, div0);
    			append(div0, span1);
    			append(div1, t5);
    			if (if_block) if_block.m(div1, null);

    			if (!mounted) {
    				dispose = listen(span1, "click", /*click_handler*/ ctx[3]);
    				mounted = true;
    			}
    		},
    		p(ctx, [dirty]) {
    			if (dirty & /*User*/ 1 && t1_value !== (t1_value = /*User*/ ctx[0].username + "")) set_data(t1, t1_value);

    			if (dirty & /*User*/ 1 && label_class_value !== (label_class_value = "" + (null_to_empty(/*User*/ ctx[0].role) + " svelte-1kmdy4"))) {
    				attr(label, "class", label_class_value);
    			}

    			if (dirty & /*User*/ 1) show_if = !/*User*/ ctx[0].role.includes("Administrator");

    			if (show_if) {
    				if (if_block) {
    					if_block.p(ctx, dirty);
    				} else {
    					if_block = create_if_block$k(ctx);
    					if_block.c();
    					if_block.m(div1, null);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}

    			if (dirty & /*User*/ 1 && div1_class_value !== (div1_class_value = "" + (null_to_empty(/*User*/ ctx[0].role.includes("User")
    			? "user-config"
    			: "admin-config") + " svelte-1kmdy4"))) {
    				attr(div1, "class", div1_class_value);
    			}
    		},
    		i: noop,
    		o: noop,
    		d(detaching) {
    			if (detaching) detach(label);
    			if (detaching) detach(t2);
    			if (detaching) detach(input);
    			if (detaching) detach(t3);
    			if (detaching) detach(div1);
    			if (if_block) if_block.d();
    			mounted = false;
    			dispose();
    		}
    	};
    }

    function instance$y($$self, $$props, $$invalidate) {
    	let $PageConfig;
    	component_subscribe($$self, PageConfig, $$value => $$invalidate(7, $PageConfig = $$value));
    	let { User } = $$props;
    	document.title.split(" ")[0];
    	const Config = { ...$PageConfig };

    	const applyChanges = () => {
    		updateConfig(Config);
    	};

    	const observer = new MutationObserver(([{ target }]) => document.title.split(" ")[0]);
    	observer.observe(document.querySelector("title"), { childList: true });

    	function click_handler(event) {
    		bubble.call(this, $$self, event);
    	}

    	function select_change_handler() {
    		Config.order[document.title.split(" ")[0]] = select_value(this);
    		$$invalidate(1, Config);
    	}

    	function input_input_handler() {
    		Config.items = to_number(this.value);
    		$$invalidate(1, Config);
    	}

    	$$self.$$set = $$props => {
    		if ('User' in $$props) $$invalidate(0, User = $$props.User);
    	};

    	return [
    		User,
    		Config,
    		applyChanges,
    		click_handler,
    		select_change_handler,
    		input_input_handler
    	];
    }

    class Config_1 extends SvelteComponent {
    	constructor(options) {
    		super();
    		init(this, options, instance$y, create_fragment$y, safe_not_equal, { User: 0 });
    	}
    }

    const ToggleMenu = writable(false);

    const updateToggleMenu = async (newVal) => {
      ToggleMenu.update((value) => (newVal !== undefined ? newVal : !value));
    };

    /* src\ShareComponent\Navbar.svelte generated by Svelte v3.49.0 */

    function get_each_context$b(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[10] = list[i];
    	return child_ctx;
    }

    function get_each_context_1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[13] = list[i].Id;
    	child_ctx[14] = list[i].Name;
    	return child_ctx;
    }

    // (81:6) {:else}
    function create_else_block$b(ctx) {
    	let li;
    	let link;
    	let t;
    	let current;

    	link = new Link({
    			props: {
    				to: /*item*/ ctx[10].path,
    				getProps,
    				$$slots: { default: [create_default_slot_1$1] },
    				$$scope: { ctx }
    			}
    		});

    	return {
    		c() {
    			li = element("li");
    			create_component(link.$$.fragment);
    			t = space();
    			attr(li, "class", "nav-item svelte-18k938q");
    		},
    		m(target, anchor) {
    			insert(target, li, anchor);
    			mount_component(link, li, null);
    			append(li, t);
    			current = true;
    		},
    		p(ctx, dirty) {
    			const link_changes = {};
    			if (dirty & /*navItems*/ 1) link_changes.to = /*item*/ ctx[10].path;

    			if (dirty & /*$$scope, navItems*/ 131073) {
    				link_changes.$$scope = { dirty, ctx };
    			}

    			link.$set(link_changes);
    		},
    		i(local) {
    			if (current) return;
    			transition_in(link.$$.fragment, local);
    			current = true;
    		},
    		o(local) {
    			transition_out(link.$$.fragment, local);
    			current = false;
    		},
    		d(detaching) {
    			if (detaching) detach(li);
    			destroy_component(link);
    		}
    	};
    }

    // (57:6) {#if ["Mangas", "Videos"].includes(item.title)}
    function create_if_block$j(ctx) {
    	let if_block_anchor;
    	let current;
    	let if_block = /*dirs*/ ctx[1] && create_if_block_1$8(ctx);

    	return {
    		c() {
    			if (if_block) if_block.c();
    			if_block_anchor = empty$1();
    		},
    		m(target, anchor) {
    			if (if_block) if_block.m(target, anchor);
    			insert(target, if_block_anchor, anchor);
    			current = true;
    		},
    		p(ctx, dirty) {
    			if (/*dirs*/ ctx[1]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);

    					if (dirty & /*dirs*/ 2) {
    						transition_in(if_block, 1);
    					}
    				} else {
    					if_block = create_if_block_1$8(ctx);
    					if_block.c();
    					transition_in(if_block, 1);
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			} else if (if_block) {
    				group_outros();

    				transition_out(if_block, 1, 1, () => {
    					if_block = null;
    				});

    				check_outros();
    			}
    		},
    		i(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d(detaching) {
    			if (if_block) if_block.d(detaching);
    			if (detaching) detach(if_block_anchor);
    		}
    	};
    }

    // (83:10) <Link to={item.path} {getProps}>
    function create_default_slot_1$1(ctx) {
    	let i;
    	let i_class_value;
    	let t0;
    	let span;
    	let t1_value = /*item*/ ctx[10].title + "";
    	let t1;

    	return {
    		c() {
    			i = element("i");
    			t0 = space();
    			span = element("span");
    			t1 = text(t1_value);
    			attr(i, "class", i_class_value = "" + (null_to_empty("fas fa-" + /*item*/ ctx[10].class) + " svelte-18k938q"));
    			attr(span, "class", "nav-title svelte-18k938q");
    		},
    		m(target, anchor) {
    			insert(target, i, anchor);
    			insert(target, t0, anchor);
    			insert(target, span, anchor);
    			append(span, t1);
    		},
    		p(ctx, dirty) {
    			if (dirty & /*navItems*/ 1 && i_class_value !== (i_class_value = "" + (null_to_empty("fas fa-" + /*item*/ ctx[10].class) + " svelte-18k938q"))) {
    				attr(i, "class", i_class_value);
    			}

    			if (dirty & /*navItems*/ 1 && t1_value !== (t1_value = /*item*/ ctx[10].title + "")) set_data(t1, t1_value);
    		},
    		d(detaching) {
    			if (detaching) detach(i);
    			if (detaching) detach(t0);
    			if (detaching) detach(span);
    		}
    	};
    }

    // (58:8) {#if dirs}
    function create_if_block_1$8(ctx) {
    	let li;
    	let link;
    	let t;
    	let current;

    	link = new Link({
    			props: {
    				to: /*item*/ ctx[10].path + "/" + /*selected*/ ctx[2][/*item*/ ctx[10].title],
    				getProps,
    				$$slots: { default: [create_default_slot$5] },
    				$$scope: { ctx }
    			}
    		});

    	return {
    		c() {
    			li = element("li");
    			create_component(link.$$.fragment);
    			t = space();
    			attr(li, "class", "nav-item svelte-18k938q");
    		},
    		m(target, anchor) {
    			insert(target, li, anchor);
    			mount_component(link, li, null);
    			append(li, t);
    			current = true;
    		},
    		p(ctx, dirty) {
    			const link_changes = {};
    			if (dirty & /*navItems, selected*/ 5) link_changes.to = /*item*/ ctx[10].path + "/" + /*selected*/ ctx[2][/*item*/ ctx[10].title];

    			if (dirty & /*$$scope, dirs, navItems, selected*/ 131079) {
    				link_changes.$$scope = { dirty, ctx };
    			}

    			link.$set(link_changes);
    		},
    		i(local) {
    			if (current) return;
    			transition_in(link.$$.fragment, local);
    			current = true;
    		},
    		o(local) {
    			transition_out(link.$$.fragment, local);
    			current = false;
    		},
    		d(detaching) {
    			if (detaching) detach(li);
    			destroy_component(link);
    		}
    	};
    }

    // (65:18) {#each dirs[item.title].filter((d) => d.Type === item.title) as { Id, Name }}
    function create_each_block_1(ctx) {
    	let li;
    	let t0_value = /*Name*/ ctx[14] + "";
    	let t0;
    	let t1;
    	let li_id_value;
    	let li_title_value;
    	let mounted;
    	let dispose;

    	return {
    		c() {
    			li = element("li");
    			t0 = text(t0_value);
    			t1 = space();
    			attr(li, "class", "list-item svelte-18k938q");
    			attr(li, "id", li_id_value = /*Id*/ ctx[13]);
    			attr(li, "title", li_title_value = /*item*/ ctx[10].title);
    			toggle_class(li, "selected", /*Id*/ ctx[13] === /*selected*/ ctx[2][/*item*/ ctx[10].title]);
    		},
    		m(target, anchor) {
    			insert(target, li, anchor);
    			append(li, t0);
    			append(li, t1);

    			if (!mounted) {
    				dispose = listen(li, "click", /*selectDir*/ ctx[5]);
    				mounted = true;
    			}
    		},
    		p(ctx, dirty) {
    			if (dirty & /*dirs, navItems*/ 3 && t0_value !== (t0_value = /*Name*/ ctx[14] + "")) set_data(t0, t0_value);

    			if (dirty & /*dirs, navItems*/ 3 && li_id_value !== (li_id_value = /*Id*/ ctx[13])) {
    				attr(li, "id", li_id_value);
    			}

    			if (dirty & /*navItems*/ 1 && li_title_value !== (li_title_value = /*item*/ ctx[10].title)) {
    				attr(li, "title", li_title_value);
    			}

    			if (dirty & /*dirs, navItems, selected*/ 7) {
    				toggle_class(li, "selected", /*Id*/ ctx[13] === /*selected*/ ctx[2][/*item*/ ctx[10].title]);
    			}
    		},
    		d(detaching) {
    			if (detaching) detach(li);
    			mounted = false;
    			dispose();
    		}
    	};
    }

    // (60:12) <Link to={item.path + "/" + selected[item.title]} {getProps}>
    function create_default_slot$5(ctx) {
    	let span1;
    	let i;
    	let i_class_value;
    	let t0;
    	let span0;
    	let t1_value = /*item*/ ctx[10].title + "";
    	let t1;
    	let t2;
    	let ul;

    	function func(...args) {
    		return /*func*/ ctx[6](/*item*/ ctx[10], ...args);
    	}

    	let each_value_1 = /*dirs*/ ctx[1][/*item*/ ctx[10].title].filter(func);
    	let each_blocks = [];

    	for (let i = 0; i < each_value_1.length; i += 1) {
    		each_blocks[i] = create_each_block_1(get_each_context_1(ctx, each_value_1, i));
    	}

    	return {
    		c() {
    			span1 = element("span");
    			i = element("i");
    			t0 = space();
    			span0 = element("span");
    			t1 = text(t1_value);
    			t2 = space();
    			ul = element("ul");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr(i, "class", i_class_value = "" + (null_to_empty("fas fa-" + /*item*/ ctx[10].class) + " svelte-18k938q"));
    			attr(span0, "class", "nav-title svelte-18k938q");
    			attr(ul, "class", "down-list svelte-18k938q");
    			attr(span1, "class", "fa-icon svelte-18k938q");
    		},
    		m(target, anchor) {
    			insert(target, span1, anchor);
    			append(span1, i);
    			append(span1, t0);
    			append(span1, span0);
    			append(span0, t1);
    			append(span1, t2);
    			append(span1, ul);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(ul, null);
    			}
    		},
    		p(new_ctx, dirty) {
    			ctx = new_ctx;

    			if (dirty & /*navItems*/ 1 && i_class_value !== (i_class_value = "" + (null_to_empty("fas fa-" + /*item*/ ctx[10].class) + " svelte-18k938q"))) {
    				attr(i, "class", i_class_value);
    			}

    			if (dirty & /*navItems*/ 1 && t1_value !== (t1_value = /*item*/ ctx[10].title + "")) set_data(t1, t1_value);

    			if (dirty & /*dirs, navItems, selected, selectDir*/ 39) {
    				each_value_1 = /*dirs*/ ctx[1][/*item*/ ctx[10].title].filter(func);
    				let i;

    				for (i = 0; i < each_value_1.length; i += 1) {
    					const child_ctx = get_each_context_1(ctx, each_value_1, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block_1(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(ul, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value_1.length;
    			}
    		},
    		d(detaching) {
    			if (detaching) detach(span1);
    			destroy_each(each_blocks, detaching);
    		}
    	};
    }

    // (56:4) {#each navItems as item}
    function create_each_block$b(ctx) {
    	let show_if;
    	let current_block_type_index;
    	let if_block;
    	let if_block_anchor;
    	let current;
    	const if_block_creators = [create_if_block$j, create_else_block$b];
    	const if_blocks = [];

    	function select_block_type(ctx, dirty) {
    		if (dirty & /*navItems*/ 1) show_if = null;
    		if (show_if == null) show_if = !!["Mangas", "Videos"].includes(/*item*/ ctx[10].title);
    		if (show_if) return 0;
    		return 1;
    	}

    	current_block_type_index = select_block_type(ctx, -1);
    	if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);

    	return {
    		c() {
    			if_block.c();
    			if_block_anchor = empty$1();
    		},
    		m(target, anchor) {
    			if_blocks[current_block_type_index].m(target, anchor);
    			insert(target, if_block_anchor, anchor);
    			current = true;
    		},
    		p(ctx, dirty) {
    			let previous_block_index = current_block_type_index;
    			current_block_type_index = select_block_type(ctx, dirty);

    			if (current_block_type_index === previous_block_index) {
    				if_blocks[current_block_type_index].p(ctx, dirty);
    			} else {
    				group_outros();

    				transition_out(if_blocks[previous_block_index], 1, 1, () => {
    					if_blocks[previous_block_index] = null;
    				});

    				check_outros();
    				if_block = if_blocks[current_block_type_index];

    				if (!if_block) {
    					if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    					if_block.c();
    				} else {
    					if_block.p(ctx, dirty);
    				}

    				transition_in(if_block, 1);
    				if_block.m(if_block_anchor.parentNode, if_block_anchor);
    			}
    		},
    		i(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d(detaching) {
    			if_blocks[current_block_type_index].d(detaching);
    			if (detaching) detach(if_block_anchor);
    		}
    	};
    }

    function create_fragment$x(ctx) {
    	let nav;
    	let ul0;
    	let t;
    	let ul1;
    	let li;
    	let config;
    	let current;
    	let each_value = /*navItems*/ ctx[0];
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$b(get_each_context$b(ctx, each_value, i));
    	}

    	const out = i => transition_out(each_blocks[i], 1, 1, () => {
    		each_blocks[i] = null;
    	});

    	config = new Config_1({ props: { User: /*User*/ ctx[4] } });
    	config.$on("click", /*click_handler*/ ctx[7]);

    	return {
    		c() {
    			nav = element("nav");
    			ul0 = element("ul");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t = space();
    			ul1 = element("ul");
    			li = element("li");
    			create_component(config.$$.fragment);
    			attr(ul0, "class", "navbar-nav svelte-18k938q");
    			attr(li, "id", "p-config");
    			attr(li, "class", "nav-item svelte-18k938q");
    			attr(ul1, "class", "navbar-nav svelte-18k938q");
    			attr(nav, "id", "menu");
    			attr(nav, "class", "navbar svelte-18k938q");
    			toggle_class(nav, "hide", /*menuToggle*/ ctx[3]);
    		},
    		m(target, anchor) {
    			insert(target, nav, anchor);
    			append(nav, ul0);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(ul0, null);
    			}

    			append(nav, t);
    			append(nav, ul1);
    			append(ul1, li);
    			mount_component(config, li, null);
    			current = true;
    		},
    		p(ctx, [dirty]) {
    			if (dirty & /*navItems, selected, getProps, dirs, selectDir*/ 39) {
    				each_value = /*navItems*/ ctx[0];
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$b(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    						transition_in(each_blocks[i], 1);
    					} else {
    						each_blocks[i] = create_each_block$b(child_ctx);
    						each_blocks[i].c();
    						transition_in(each_blocks[i], 1);
    						each_blocks[i].m(ul0, null);
    					}
    				}

    				group_outros();

    				for (i = each_value.length; i < each_blocks.length; i += 1) {
    					out(i);
    				}

    				check_outros();
    			}

    			if (dirty & /*menuToggle*/ 8) {
    				toggle_class(nav, "hide", /*menuToggle*/ ctx[3]);
    			}
    		},
    		i(local) {
    			if (current) return;

    			for (let i = 0; i < each_value.length; i += 1) {
    				transition_in(each_blocks[i]);
    			}

    			transition_in(config.$$.fragment, local);
    			current = true;
    		},
    		o(local) {
    			each_blocks = each_blocks.filter(Boolean);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				transition_out(each_blocks[i]);
    			}

    			transition_out(config.$$.fragment, local);
    			current = false;
    		},
    		d(detaching) {
    			if (detaching) detach(nav);
    			destroy_each(each_blocks, detaching);
    			destroy_component(config);
    		}
    	};
    }

    function getProps({ location, href, isPartiallyCurrent, isCurrent }) {
    	let isActive = false;
    	if (href === "/" && location.pathname === "/") isActive = true;

    	if (href !== "/" && isPartiallyCurrent) {
    		isActive = true;
    	}

    	if (isActive) {
    		return { class: "active" };
    	}

    	return {};
    }

    function instance$x($$self, $$props, $$invalidate) {
    	let { navItems } = $$props;
    	const sortName = (a, b) => a.Name.localeCompare(b.Name);
    	const User = getContext("User");
    	let dirs;
    	let selected = { Mangas: "", Videos: "" };
    	let menuToggle = false;

    	let unSubscribe = ToggleMenu.subscribe(value => {
    		$$invalidate(3, menuToggle = value);
    	});

    	onDestroy(unSubscribe);

    	const selectDir = ({ target: { id, title } }) => {
    		$$invalidate(2, selected[title] = id, selected);
    	};

    	const func = (item, d) => d.Type === item.title;

    	function click_handler(event) {
    		bubble.call(this, $$self, event);
    	}

    	$$self.$$set = $$props => {
    		if ('navItems' in $$props) $$invalidate(0, navItems = $$props.navItems);
    	};

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*dirs*/ 2) {
    			if (!dirs) {
    				axios.get("/api/files/dirs/").then(({ data }) => {
    					if (data instanceof Array) {
    						let Mangas = (data || []).filter(d => d.Type === "Mangas").sort(sortName);
    						let Videos = (data || []).filter(d => d.Type === "Videos").sort(sortName);
    						$$invalidate(1, dirs = { Mangas, Videos });

    						$$invalidate(2, selected = {
    							Mangas: Mangas[0] ? Mangas[0].Id : "",
    							Videos: Videos[0] ? Videos[0].Id : ""
    						});
    					}
    				});
    			}
    		}
    	};

    	return [navItems, dirs, selected, menuToggle, User, selectDir, func, click_handler];
    }

    class Navbar extends SvelteComponent {
    	constructor(options) {
    		super();
    		init(this, options, instance$x, create_fragment$x, safe_not_equal, { navItems: 0 });
    	}
    }

    function cubicOut(t) {
        const f = t - 1.0;
        return f * f * f + 1.0;
    }

    function fade(node, { delay = 0, duration = 400, easing = identity } = {}) {
        const o = +getComputedStyle(node).opacity;
        return {
            delay,
            duration,
            easing,
            css: t => `opacity: ${t * o}`
        };
    }
    function fly(node, { delay = 0, duration = 400, easing = cubicOut, x = 0, y = 0, opacity = 0 } = {}) {
        const style = getComputedStyle(node);
        const target_opacity = +style.opacity;
        const transform = style.transform === 'none' ? '' : style.transform;
        const od = target_opacity * (1 - opacity);
        return {
            delay,
            duration,
            easing,
            css: (t, u) => `
			transform: ${transform} translate(${(1 - t) * x}px, ${(1 - t) * y}px);
			opacity: ${target_opacity - (od * u)}`
        };
    }

    /* src\Admin\Component\ModalUser.svelte generated by Svelte v3.49.0 */

    function create_fragment$w(ctx) {
    	let div16;
    	let div15;
    	let div0;
    	let h3;
    	let t0_value = (/*foundUser*/ ctx[0].Id ? 'Edit' : 'Create') + "";
    	let t0;
    	let t1;
    	let div13;
    	let input0;
    	let t2;
    	let div2;
    	let div1;
    	let t3;
    	let input1;
    	let t4;
    	let div4;
    	let div3;
    	let t5;
    	let input2;
    	let t6;
    	let div6;
    	let div5;
    	let t8;
    	let select0;
    	let option0;
    	let option1;
    	let option2;
    	let t12;
    	let div11;
    	let div8;
    	let div7;
    	let t14;
    	let select1;
    	let option3;
    	let option4;
    	let t17;
    	let div10;
    	let div9;
    	let t19;
    	let input3;
    	let t20;
    	let label5;
    	let t21;
    	let div12;
    	let t22;
    	let t23;
    	let div14;
    	let button0;
    	let t25;
    	let button1;
    	let t26_value = (/*foundUser*/ ctx[0].Id ? 'Update' : 'Save') + "";
    	let t26;
    	let div15_transition;
    	let current;
    	let mounted;
    	let dispose;

    	return {
    		c() {
    			div16 = element("div");
    			div15 = element("div");
    			div0 = element("div");
    			h3 = element("h3");
    			t0 = text(t0_value);
    			t1 = space();
    			div13 = element("div");
    			input0 = element("input");
    			t2 = space();
    			div2 = element("div");
    			div1 = element("div");
    			div1.innerHTML = `<label for="Name" class="input-group-text svelte-13h6j0"><i class="fas fa-user svelte-13h6j0"></i></label>`;
    			t3 = space();
    			input1 = element("input");
    			t4 = space();
    			div4 = element("div");
    			div3 = element("div");
    			div3.innerHTML = `<label for="Password" class="input-group-text svelte-13h6j0"><i class="fas fa-key svelte-13h6j0"></i></label>`;
    			t5 = space();
    			input2 = element("input");
    			t6 = space();
    			div6 = element("div");
    			div5 = element("div");
    			div5.innerHTML = `<label for="Role" class="input-group-text">Role</label>`;
    			t8 = space();
    			select0 = element("select");
    			option0 = element("option");
    			option0.textContent = "User";
    			option1 = element("option");
    			option1.textContent = "Administrator";
    			option2 = element("option");
    			option2.textContent = "Manager";
    			t12 = space();
    			div11 = element("div");
    			div8 = element("div");
    			div7 = element("div");
    			div7.innerHTML = `<label for="State" class="input-group-text">Status</label>`;
    			t14 = space();
    			select1 = element("select");
    			option3 = element("option");
    			option3.textContent = "Active";
    			option4 = element("option");
    			option4.textContent = "Inactive";
    			t17 = space();
    			div10 = element("div");
    			div9 = element("div");
    			div9.innerHTML = `<label for="Adult" class="input-group-text">Adult</label>`;
    			t19 = space();
    			input3 = element("input");
    			t20 = space();
    			label5 = element("label");
    			label5.innerHTML = `<i class="fas fa-times svelte-13h6j0"></i>`;
    			t21 = space();
    			div12 = element("div");
    			t22 = text(/*error*/ ctx[1]);
    			t23 = space();
    			div14 = element("div");
    			button0 = element("button");
    			button0.textContent = "Cancel";
    			t25 = space();
    			button1 = element("button");
    			t26 = text(t26_value);
    			attr(div0, "class", "modal-header");
    			attr(input0, "type", "hidden");
    			attr(input0, "name", "Id");
    			attr(input0, "class", "svelte-13h6j0");
    			attr(div1, "class", "input-group-prepend");
    			attr(input1, "class", "form-control svelte-13h6j0");
    			attr(input1, "type", "text");
    			attr(input1, "name", "Name");
    			attr(div2, "class", "input-group");
    			attr(div3, "class", "input-group-prepend");
    			attr(input2, "class", "form-control svelte-13h6j0");
    			attr(input2, "type", "password");
    			attr(input2, "autocomplete", "new-password");
    			attr(div4, "class", "input-group");
    			attr(div5, "class", "input-group-prepend");
    			option0.__value = "User";
    			option0.value = option0.__value;
    			option1.__value = "Administrator";
    			option1.value = option1.__value;
    			option2.__value = "Manager";
    			option2.value = option2.__value;
    			attr(select0, "class", "form-control");
    			attr(select0, "name", "Role");
    			if (/*foundUser*/ ctx[0].Role === void 0) add_render_callback(() => /*select0_change_handler*/ ctx[7].call(select0));
    			attr(div6, "class", "input-group");
    			attr(div7, "class", "input-group-prepend");
    			option3.__value = "Active";
    			option3.value = option3.__value;
    			option4.__value = "Inactive";
    			option4.value = option4.__value;
    			attr(select1, "class", "form-control");
    			attr(select1, "name", "State");
    			if (/*foundUser*/ ctx[0].Status === void 0) add_render_callback(() => /*select1_change_handler*/ ctx[8].call(select1));
    			attr(div8, "class", "first-ctrl input-group svelte-13h6j0");
    			attr(div9, "class", "input-group-prepend");
    			attr(input3, "id", "Adult");
    			attr(input3, "type", "checkbox");
    			attr(input3, "class", "svelte-13h6j0");
    			attr(label5, "for", "Adult");
    			attr(label5, "class", "form-control checkadult svelte-13h6j0");
    			attr(div10, "class", "second-ctrl input-group svelte-13h6j0");
    			attr(div11, "class", "input-grouping svelte-13h6j0");
    			attr(div12, "class", "errors");
    			attr(div13, "class", "modal-body");
    			attr(button0, "class", "btn");
    			attr(button1, "class", "btn");
    			attr(div14, "class", "modal-footer");
    			attr(div15, "class", "modal card svelte-13h6j0");
    			attr(div16, "class", "modal-container");
    		},
    		m(target, anchor) {
    			insert(target, div16, anchor);
    			append(div16, div15);
    			append(div15, div0);
    			append(div0, h3);
    			append(h3, t0);
    			append(div15, t1);
    			append(div15, div13);
    			append(div13, input0);
    			set_input_value(input0, /*foundUser*/ ctx[0].Id);
    			append(div13, t2);
    			append(div13, div2);
    			append(div2, div1);
    			append(div2, t3);
    			append(div2, input1);
    			set_input_value(input1, /*foundUser*/ ctx[0].Name);
    			append(div13, t4);
    			append(div13, div4);
    			append(div4, div3);
    			append(div4, t5);
    			append(div4, input2);
    			set_input_value(input2, /*foundUser*/ ctx[0].Password);
    			append(div13, t6);
    			append(div13, div6);
    			append(div6, div5);
    			append(div6, t8);
    			append(div6, select0);
    			append(select0, option0);
    			append(select0, option1);
    			append(select0, option2);
    			select_option(select0, /*foundUser*/ ctx[0].Role);
    			append(div13, t12);
    			append(div13, div11);
    			append(div11, div8);
    			append(div8, div7);
    			append(div8, t14);
    			append(div8, select1);
    			append(select1, option3);
    			append(select1, option4);
    			select_option(select1, /*foundUser*/ ctx[0].Status);
    			append(div11, t17);
    			append(div11, div10);
    			append(div10, div9);
    			append(div10, t19);
    			append(div10, input3);
    			input3.checked = /*foundUser*/ ctx[0].AdultPass;
    			append(div10, t20);
    			append(div10, label5);
    			append(div13, t21);
    			append(div13, div12);
    			append(div12, t22);
    			append(div15, t23);
    			append(div15, div14);
    			append(div14, button0);
    			append(div14, t25);
    			append(div14, button1);
    			append(button1, t26);
    			current = true;

    			if (!mounted) {
    				dispose = [
    					listen(input0, "input", /*input0_input_handler*/ ctx[4]),
    					listen(input1, "input", /*input1_input_handler*/ ctx[5]),
    					listen(input2, "input", /*input2_input_handler*/ ctx[6]),
    					listen(select0, "change", /*select0_change_handler*/ ctx[7]),
    					listen(select1, "change", /*select1_change_handler*/ ctx[8]),
    					listen(input3, "change", /*input3_change_handler*/ ctx[9]),
    					listen(button0, "click", /*closeModal*/ ctx[3]),
    					listen(button1, "click", /*submit*/ ctx[2])
    				];

    				mounted = true;
    			}
    		},
    		p(ctx, [dirty]) {
    			if ((!current || dirty & /*foundUser*/ 1) && t0_value !== (t0_value = (/*foundUser*/ ctx[0].Id ? 'Edit' : 'Create') + "")) set_data(t0, t0_value);

    			if (dirty & /*foundUser*/ 1) {
    				set_input_value(input0, /*foundUser*/ ctx[0].Id);
    			}

    			if (dirty & /*foundUser*/ 1 && input1.value !== /*foundUser*/ ctx[0].Name) {
    				set_input_value(input1, /*foundUser*/ ctx[0].Name);
    			}

    			if (dirty & /*foundUser*/ 1 && input2.value !== /*foundUser*/ ctx[0].Password) {
    				set_input_value(input2, /*foundUser*/ ctx[0].Password);
    			}

    			if (dirty & /*foundUser*/ 1) {
    				select_option(select0, /*foundUser*/ ctx[0].Role);
    			}

    			if (dirty & /*foundUser*/ 1) {
    				select_option(select1, /*foundUser*/ ctx[0].Status);
    			}

    			if (dirty & /*foundUser*/ 1) {
    				input3.checked = /*foundUser*/ ctx[0].AdultPass;
    			}

    			if (!current || dirty & /*error*/ 2) set_data(t22, /*error*/ ctx[1]);
    			if ((!current || dirty & /*foundUser*/ 1) && t26_value !== (t26_value = (/*foundUser*/ ctx[0].Id ? 'Update' : 'Save') + "")) set_data(t26, t26_value);
    		},
    		i(local) {
    			if (current) return;

    			add_render_callback(() => {
    				if (!div15_transition) div15_transition = create_bidirectional_transition(div15, fade, { duration: 200 }, true);
    				div15_transition.run(1);
    			});

    			current = true;
    		},
    		o(local) {
    			if (!div15_transition) div15_transition = create_bidirectional_transition(div15, fade, { duration: 200 }, false);
    			div15_transition.run(0);
    			current = false;
    		},
    		d(detaching) {
    			if (detaching) detach(div16);
    			if (detaching && div15_transition) div15_transition.end();
    			mounted = false;
    			run_all(dispose);
    		}
    	};
    }

    function instance$w($$self, $$props, $$invalidate) {
    	let { foundUser = { AdultPass: false, Password: "" } } = $$props;
    	const dispatch = createEventDispatcher();
    	let error = "";

    	const submit = e => {
    		if (!foundUser.Name) return $$invalidate(1, error = "Name Can't be empty");

    		axios.post("/api/admin/users/add-edit", foundUser).then(({ data }) => {
    			if (!data.fail) {
    				dispatch("updateusers", data.user);
    			} else {
    				$$invalidate(1, error = data.msg);
    				console.log(data);
    			}
    		});
    	};

    	const closeModal = () => {
    		dispatch("closeModal");
    	};

    	function input0_input_handler() {
    		foundUser.Id = this.value;
    		$$invalidate(0, foundUser);
    	}

    	function input1_input_handler() {
    		foundUser.Name = this.value;
    		$$invalidate(0, foundUser);
    	}

    	function input2_input_handler() {
    		foundUser.Password = this.value;
    		$$invalidate(0, foundUser);
    	}

    	function select0_change_handler() {
    		foundUser.Role = select_value(this);
    		$$invalidate(0, foundUser);
    	}

    	function select1_change_handler() {
    		foundUser.Status = select_value(this);
    		$$invalidate(0, foundUser);
    	}

    	function input3_change_handler() {
    		foundUser.AdultPass = this.checked;
    		$$invalidate(0, foundUser);
    	}

    	$$self.$$set = $$props => {
    		if ('foundUser' in $$props) $$invalidate(0, foundUser = $$props.foundUser);
    	};

    	return [
    		foundUser,
    		error,
    		submit,
    		closeModal,
    		input0_input_handler,
    		input1_input_handler,
    		input2_input_handler,
    		select0_change_handler,
    		select1_change_handler,
    		input3_change_handler
    	];
    }

    class ModalUser extends SvelteComponent {
    	constructor(options) {
    		super();
    		init(this, options, instance$w, create_fragment$w, safe_not_equal, { foundUser: 0 });
    	}
    }

    /* src\Admin\User.svelte generated by Svelte v3.49.0 */

    function get_each_context$a(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[8] = list[i];
    	return child_ctx;
    }

    // (95:0) {#if showModal}
    function create_if_block_1$7(ctx) {
    	let modaluser;
    	let current;

    	modaluser = new ModalUser({
    			props: { foundUser: /*foundUser*/ ctx[1] }
    		});

    	modaluser.$on("closeModal", /*hideModal*/ ctx[4]);
    	modaluser.$on("updateusers", /*updateUsers*/ ctx[7]);

    	return {
    		c() {
    			create_component(modaluser.$$.fragment);
    		},
    		m(target, anchor) {
    			mount_component(modaluser, target, anchor);
    			current = true;
    		},
    		p(ctx, dirty) {
    			const modaluser_changes = {};
    			if (dirty & /*foundUser*/ 2) modaluser_changes.foundUser = /*foundUser*/ ctx[1];
    			modaluser.$set(modaluser_changes);
    		},
    		i(local) {
    			if (current) return;
    			transition_in(modaluser.$$.fragment, local);
    			current = true;
    		},
    		o(local) {
    			transition_out(modaluser.$$.fragment, local);
    			current = false;
    		},
    		d(detaching) {
    			destroy_component(modaluser, detaching);
    		}
    	};
    }

    // (137:6) {:else}
    function create_else_block$a(ctx) {
    	let tr;

    	return {
    		c() {
    			tr = element("tr");
    			tr.innerHTML = `<td colspan="5" class="svelte-u9hanp">Loading Data From Server</td>`;
    		},
    		m(target, anchor) {
    			insert(target, tr, anchor);
    		},
    		p: noop,
    		d(detaching) {
    			if (detaching) detach(tr);
    		}
    	};
    }

    // (120:6) {#if users.length}
    function create_if_block$i(ctx) {
    	let each_1_anchor;
    	let each_value = /*users*/ ctx[0];
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$a(get_each_context$a(ctx, each_value, i));
    	}

    	return {
    		c() {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			each_1_anchor = empty$1();
    		},
    		m(target, anchor) {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(target, anchor);
    			}

    			insert(target, each_1_anchor, anchor);
    		},
    		p(ctx, dirty) {
    			if (dirty & /*users, removeUser, saveEdit*/ 97) {
    				each_value = /*users*/ ctx[0];
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$a(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block$a(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(each_1_anchor.parentNode, each_1_anchor);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}
    		},
    		d(detaching) {
    			destroy_each(each_blocks, detaching);
    			if (detaching) detach(each_1_anchor);
    		}
    	};
    }

    // (121:8) {#each users as user}
    function create_each_block$a(ctx) {
    	let tr;
    	let td0;
    	let span0;
    	let t0;
    	let span1;
    	let t1;
    	let td1;
    	let t2_value = /*user*/ ctx[8].Name + "";
    	let t2;
    	let t3;
    	let td2;
    	let t4_value = /*user*/ ctx[8].Role + "";
    	let t4;
    	let t5;
    	let td3;
    	let t6_value = /*user*/ ctx[8].State + "";
    	let t6;
    	let t7;
    	let td4;
    	let t8_value = (/*user*/ ctx[8].AdultPass ? 'true' : 'false') + "";
    	let t8;
    	let t9;
    	let tr_id_value;
    	let tr_key_value;
    	let mounted;
    	let dispose;

    	return {
    		c() {
    			tr = element("tr");
    			td0 = element("td");
    			span0 = element("span");
    			span0.innerHTML = `<i class="fas fa-edit svelte-u9hanp"></i>`;
    			t0 = space();
    			span1 = element("span");
    			span1.innerHTML = `<i class="fas fa-trash-alt svelte-u9hanp"></i>`;
    			t1 = space();
    			td1 = element("td");
    			t2 = text(t2_value);
    			t3 = space();
    			td2 = element("td");
    			t4 = text(t4_value);
    			t5 = space();
    			td3 = element("td");
    			t6 = text(t6_value);
    			t7 = space();
    			td4 = element("td");
    			t8 = text(t8_value);
    			t9 = space();
    			attr(span0, "class", "u-edit");
    			attr(span1, "class", "u-remove ml-2");
    			attr(td0, "class", "svelte-u9hanp");
    			attr(td1, "class", "svelte-u9hanp");
    			attr(td2, "class", "svelte-u9hanp");
    			attr(td3, "class", "svelte-u9hanp");
    			attr(td4, "class", "svelte-u9hanp");
    			attr(tr, "id", tr_id_value = /*user*/ ctx[8].Id);
    			attr(tr, "key", tr_key_value = /*user*/ ctx[8].Name);
    			attr(tr, "class", "svelte-u9hanp");
    		},
    		m(target, anchor) {
    			insert(target, tr, anchor);
    			append(tr, td0);
    			append(td0, span0);
    			append(td0, t0);
    			append(td0, span1);
    			append(tr, t1);
    			append(tr, td1);
    			append(td1, t2);
    			append(tr, t3);
    			append(tr, td2);
    			append(td2, t4);
    			append(tr, t5);
    			append(tr, td3);
    			append(td3, t6);
    			append(tr, t7);
    			append(tr, td4);
    			append(td4, t8);
    			append(tr, t9);

    			if (!mounted) {
    				dispose = [
    					listen(span0, "click", /*saveEdit*/ ctx[5]),
    					listen(span1, "click", /*removeUser*/ ctx[6])
    				];

    				mounted = true;
    			}
    		},
    		p(ctx, dirty) {
    			if (dirty & /*users*/ 1 && t2_value !== (t2_value = /*user*/ ctx[8].Name + "")) set_data(t2, t2_value);
    			if (dirty & /*users*/ 1 && t4_value !== (t4_value = /*user*/ ctx[8].Role + "")) set_data(t4, t4_value);
    			if (dirty & /*users*/ 1 && t6_value !== (t6_value = /*user*/ ctx[8].State + "")) set_data(t6, t6_value);
    			if (dirty & /*users*/ 1 && t8_value !== (t8_value = (/*user*/ ctx[8].AdultPass ? 'true' : 'false') + "")) set_data(t8, t8_value);

    			if (dirty & /*users*/ 1 && tr_id_value !== (tr_id_value = /*user*/ ctx[8].Id)) {
    				attr(tr, "id", tr_id_value);
    			}

    			if (dirty & /*users*/ 1 && tr_key_value !== (tr_key_value = /*user*/ ctx[8].Name)) {
    				attr(tr, "key", tr_key_value);
    			}
    		},
    		d(detaching) {
    			if (detaching) detach(tr);
    			mounted = false;
    			run_all(dispose);
    		}
    	};
    }

    function create_fragment$v(ctx) {
    	let t0;
    	let div2;
    	let div0;
    	let t1;
    	let t2;
    	let div1;
    	let span;
    	let t3;
    	let h3;
    	let t5;
    	let table;
    	let thead;
    	let t15;
    	let tbody;
    	let current;
    	let mounted;
    	let dispose;
    	let if_block0 = /*showModal*/ ctx[3] && create_if_block_1$7(ctx);

    	function select_block_type(ctx, dirty) {
    		if (/*users*/ ctx[0].length) return create_if_block$i;
    		return create_else_block$a;
    	}

    	let current_block_type = select_block_type(ctx);
    	let if_block1 = current_block_type(ctx);

    	return {
    		c() {
    			if (if_block0) if_block0.c();
    			t0 = space();
    			div2 = element("div");
    			div0 = element("div");
    			t1 = text(/*error*/ ctx[2]);
    			t2 = space();
    			div1 = element("div");
    			span = element("span");
    			span.innerHTML = `<i class="fas fa-user-plus svelte-u9hanp"></i>`;
    			t3 = space();
    			h3 = element("h3");
    			h3.textContent = "Users Manager";
    			t5 = space();
    			table = element("table");
    			thead = element("thead");

    			thead.innerHTML = `<tr><th class="svelte-u9hanp">Actions</th> 
        <th class="svelte-u9hanp">Name</th> 
        <th class="svelte-u9hanp">Role</th> 
        <th class="svelte-u9hanp">State</th> 
        <th class="svelte-u9hanp">Adult</th></tr>`;

    			t15 = space();
    			tbody = element("tbody");
    			if_block1.c();
    			attr(div0, "class", "remove-error");
    			attr(span, "class", "btn svelte-u9hanp");
    			attr(h3, "class", "text-center");
    			attr(div1, "class", "controls svelte-u9hanp");
    			attr(table, "class", "table table-dark table-hover table-bordered svelte-u9hanp");
    			attr(div2, "id", "u-manager");
    			attr(div2, "class", "card bg-dark manager svelte-u9hanp");
    		},
    		m(target, anchor) {
    			if (if_block0) if_block0.m(target, anchor);
    			insert(target, t0, anchor);
    			insert(target, div2, anchor);
    			append(div2, div0);
    			append(div0, t1);
    			append(div2, t2);
    			append(div2, div1);
    			append(div1, span);
    			append(div1, t3);
    			append(div1, h3);
    			append(div2, t5);
    			append(div2, table);
    			append(table, thead);
    			append(table, t15);
    			append(table, tbody);
    			if_block1.m(tbody, null);
    			current = true;

    			if (!mounted) {
    				dispose = listen(span, "click", /*saveEdit*/ ctx[5]);
    				mounted = true;
    			}
    		},
    		p(ctx, [dirty]) {
    			if (/*showModal*/ ctx[3]) {
    				if (if_block0) {
    					if_block0.p(ctx, dirty);

    					if (dirty & /*showModal*/ 8) {
    						transition_in(if_block0, 1);
    					}
    				} else {
    					if_block0 = create_if_block_1$7(ctx);
    					if_block0.c();
    					transition_in(if_block0, 1);
    					if_block0.m(t0.parentNode, t0);
    				}
    			} else if (if_block0) {
    				group_outros();

    				transition_out(if_block0, 1, 1, () => {
    					if_block0 = null;
    				});

    				check_outros();
    			}

    			if (!current || dirty & /*error*/ 4) set_data(t1, /*error*/ ctx[2]);

    			if (current_block_type === (current_block_type = select_block_type(ctx)) && if_block1) {
    				if_block1.p(ctx, dirty);
    			} else {
    				if_block1.d(1);
    				if_block1 = current_block_type(ctx);

    				if (if_block1) {
    					if_block1.c();
    					if_block1.m(tbody, null);
    				}
    			}
    		},
    		i(local) {
    			if (current) return;
    			transition_in(if_block0);
    			current = true;
    		},
    		o(local) {
    			transition_out(if_block0);
    			current = false;
    		},
    		d(detaching) {
    			if (if_block0) if_block0.d(detaching);
    			if (detaching) detach(t0);
    			if (detaching) detach(div2);
    			if_block1.d();
    			mounted = false;
    			dispose();
    		}
    	};
    }

    function instance$v($$self, $$props, $$invalidate) {
    	let users = [];
    	let foundUser = { AdultPass: false };
    	let error = "";
    	let showModal = false;

    	const hideModal = () => {
    		$$invalidate(3, showModal = false);
    		$$invalidate(1, foundUser = { AdultPass: false });
    	};

    	const saveEdit = e => {
    		let tr = e.target.closest("tr");

    		if (tr) {
    			$$invalidate(1, foundUser = { ...users.find(u => u.Id === tr.id) } || {});
    		}

    		$$invalidate(3, showModal = true);
    	};

    	const removeUser = e => {
    		let tr = e.target.closest("tr");
    		let Role = tr.children[1].innerText;

    		if (tr) {
    			axios.delete("/api/admin/users/remove", { data: { Id: tr.id, Role } }).then(({ data }) => {
    				if (data.removed) {
    					$$invalidate(0, users = users.filter(u => u.Id !== tr.id));
    				} else {
    					$$invalidate(2, error = data.msg);
    				}
    			});
    		}
    	};

    	const updateUsers = event => {
    		let user = event.detail;

    		//Filter users
    		let filteredUsers = users.filter(u => u.Id !== user.Id);

    		//Add and sort users
    		$$invalidate(0, users = [...filteredUsers, user].sort((a, b) => {
    			return a.Name.localeCompare(b.Name);
    		}));

    		user.Password = "";
    		hideModal();
    	};

    	onMount(async () => {
    		axios.get("/api/admin/users").then(({ data }) => {
    			if (data.users) {
    				$$invalidate(0, users = data.users);
    			}
    		});
    	});

    	return [
    		users,
    		foundUser,
    		error,
    		showModal,
    		hideModal,
    		saveEdit,
    		removeUser,
    		updateUsers
    	];
    }

    class User extends SvelteComponent {
    	constructor(options) {
    		super();
    		init(this, options, instance$v, create_fragment$v, safe_not_equal, {});
    	}
    }

    const calRows = () => {
      let container = document.querySelector(".list-container") || {};
      return parseInt(container.offsetHeight / 37.19);
    };

    const clamp = (num, min, max) => Math.min(Math.max(num, min), max);

    /* src\ShareComponent\Filter.svelte generated by Svelte v3.49.0 */

    function create_fragment$u(ctx) {
    	let div1;
    	let div0;
    	let span0;
    	let t0;
    	let input;
    	let t1;
    	let span1;
    	let mounted;
    	let dispose;

    	return {
    		c() {
    			div1 = element("div");
    			div0 = element("div");
    			span0 = element("span");
    			span0.innerHTML = `<i class="fas fa-search"></i>`;
    			t0 = space();
    			input = element("input");
    			t1 = space();
    			span1 = element("span");
    			span1.innerHTML = `<i class="fas fa-times-circle"></i>`;
    			attr(span0, "class", "btn-filter input-group-text");
    			attr(div0, "class", "input-group-prepend svelte-1f7z5e6");
    			attr(input, "type", "text");
    			attr(input, "class", "form-control filter-file svelte-1f7z5e6");
    			attr(input, "placeholder", "Filter");
    			attr(span1, "id", "clear-filter");
    			attr(span1, "class", "svelte-1f7z5e6");
    			attr(div1, "id", "filter-control");
    			attr(div1, "class", "input-group svelte-1f7z5e6");
    		},
    		m(target, anchor) {
    			insert(target, div1, anchor);
    			append(div1, div0);
    			append(div0, span0);
    			append(div1, t0);
    			append(div1, input);
    			set_input_value(input, /*filter*/ ctx[0]);
    			append(div1, t1);
    			append(div1, span1);

    			if (!mounted) {
    				dispose = [
    					listen(span0, "click", /*btnFilter*/ ctx[3]),
    					listen(input, "input", /*input_input_handler*/ ctx[4]),
    					listen(input, "keydown", /*submitFilter*/ ctx[2]),
    					listen(span1, "click", /*ClearFilter*/ ctx[1])
    				];

    				mounted = true;
    			}
    		},
    		p(ctx, [dirty]) {
    			if (dirty & /*filter*/ 1 && input.value !== /*filter*/ ctx[0]) {
    				set_input_value(input, /*filter*/ ctx[0]);
    			}
    		},
    		i: noop,
    		o: noop,
    		d(detaching) {
    			if (detaching) detach(div1);
    			mounted = false;
    			run_all(dispose);
    		}
    	};
    }

    function instance$u($$self, $$props, $$invalidate) {
    	const dispatch = createEventDispatcher();
    	let { filter = "" } = $$props;

    	const ClearFilter = () => {
    		dispatch("filter", "");
    		$$invalidate(0, filter = "");
    	};

    	const submitFilter = e => {
    		if (e.keyCode === 13) {
    			dispatch("filter", (filter || "").replace(/%|\?/, ""));
    		}
    	};

    	const btnFilter = () => {
    		dispatch("filter", (filter || "").replace(/%|\?/, ""));
    	};

    	function input_input_handler() {
    		filter = this.value;
    		$$invalidate(0, filter);
    	}

    	$$self.$$set = $$props => {
    		if ('filter' in $$props) $$invalidate(0, filter = $$props.filter);
    	};

    	return [filter, ClearFilter, submitFilter, btnFilter, input_input_handler];
    }

    class Filter extends SvelteComponent {
    	constructor(options) {
    		super();
    		init(this, options, instance$u, create_fragment$u, safe_not_equal, { filter: 0 });
    	}
    }

    const paginationInput = (li, page, totalPages, dispatch) => {
      let input = li.querySelector("input");
      if (!input) {
        li.textContent = "";

        li.innerHTML = `<input type="text" value=${page} class="form-control" min=1 
                           max=${totalPages}>`;

        let newInput = li.querySelector("input");

        newInput.addEventListener("focusout", (e) => {
          li.textContent = `${page} / ${totalPages}`;
        });

        newInput.onkeydown = (event) => {
          if (event.keyCode === 13) {
            let pg = parseInt(newInput.value);
            if (!isNaN(pg)) {
              page = pg < 1 ? 1 : pg > totalPages ? totalPages : pg;
            }
            dispatch("gotopage", page);
            newInput = null;
          }
        };
        newInput.focus();
        newInput.setSelectionRange(newInput.value.length, newInput.value.length);
      }
    };

    /* src\ShareComponent\Pagination.svelte generated by Svelte v3.49.0 */

    function create_if_block$h(ctx) {
    	let div;
    	let ul;
    	let li0;
    	let t0;
    	let li1;
    	let t1;
    	let li2;
    	let t2;
    	let li3;
    	let t3;
    	let li4;
    	let mounted;
    	let dispose;

    	function select_block_type(ctx, dirty) {
    		if (/*showinput*/ ctx[3]) return create_if_block_1$6;
    		return create_else_block$9;
    	}

    	let current_block_type = select_block_type(ctx);
    	let if_block = current_block_type(ctx);

    	return {
    		c() {
    			div = element("div");
    			ul = element("ul");
    			li0 = element("li");
    			li0.innerHTML = `<i class="fas fa-angle-double-left svelte-1ps3v0w"></i>`;
    			t0 = space();
    			li1 = element("li");
    			li1.innerHTML = `<i class="fas fa-angle-left svelte-1ps3v0w"></i>`;
    			t1 = space();
    			li2 = element("li");
    			if_block.c();
    			t2 = space();
    			li3 = element("li");
    			li3.innerHTML = `<i class="fas fa-angle-right svelte-1ps3v0w"></i>`;
    			t3 = space();
    			li4 = element("li");
    			li4.innerHTML = `<i class="fas fa-angle-double-right svelte-1ps3v0w"></i>`;
    			attr(li0, "id", "first-page");
    			attr(li0, "class", "page-link svelte-1ps3v0w");
    			toggle_class(li0, "d-none", /*hideFL*/ ctx[2]);
    			attr(li1, "id", "prev-page");
    			attr(li1, "class", "page-link svelte-1ps3v0w");
    			toggle_class(li1, "border-r-left", /*hideFL*/ ctx[2]);
    			attr(li2, "id", "current-page");
    			attr(li2, "class", "page-link svelte-1ps3v0w");
    			attr(li3, "id", "next-page");
    			attr(li3, "class", "page-link svelte-1ps3v0w");
    			toggle_class(li3, "border-r-right", /*hideFL*/ ctx[2]);
    			attr(li4, "id", "last-page");
    			attr(li4, "class", "page-link svelte-1ps3v0w");
    			toggle_class(li4, "d-none", /*hideFL*/ ctx[2]);
    			attr(ul, "class", "pagination svelte-1ps3v0w");
    			attr(div, "id", "pager");
    			attr(div, "class", "svelte-1ps3v0w");
    		},
    		m(target, anchor) {
    			insert(target, div, anchor);
    			append(div, ul);
    			append(ul, li0);
    			append(ul, t0);
    			append(ul, li1);
    			append(ul, t1);
    			append(ul, li2);
    			if_block.m(li2, null);
    			append(ul, t2);
    			append(ul, li3);
    			append(ul, t3);
    			append(ul, li4);

    			if (!mounted) {
    				dispose = [
    					listen(li2, "click", /*onShowinput*/ ctx[5]),
    					listen(div, "click", /*pagerClick*/ ctx[4])
    				];

    				mounted = true;
    			}
    		},
    		p(ctx, dirty) {
    			if (dirty & /*hideFL*/ 4) {
    				toggle_class(li0, "d-none", /*hideFL*/ ctx[2]);
    			}

    			if (dirty & /*hideFL*/ 4) {
    				toggle_class(li1, "border-r-left", /*hideFL*/ ctx[2]);
    			}

    			if (current_block_type === (current_block_type = select_block_type(ctx)) && if_block) {
    				if_block.p(ctx, dirty);
    			} else {
    				if_block.d(1);
    				if_block = current_block_type(ctx);

    				if (if_block) {
    					if_block.c();
    					if_block.m(li2, null);
    				}
    			}

    			if (dirty & /*hideFL*/ 4) {
    				toggle_class(li3, "border-r-right", /*hideFL*/ ctx[2]);
    			}

    			if (dirty & /*hideFL*/ 4) {
    				toggle_class(li4, "d-none", /*hideFL*/ ctx[2]);
    			}
    		},
    		d(detaching) {
    			if (detaching) detach(div);
    			if_block.d();
    			mounted = false;
    			run_all(dispose);
    		}
    	};
    }

    // (153:16) {:else}
    function create_else_block$9(ctx) {
    	let t_value = /*page*/ ctx[0] + '/' + /*totalPages*/ ctx[1] + "";
    	let t;

    	return {
    		c() {
    			t = text(t_value);
    		},
    		m(target, anchor) {
    			insert(target, t, anchor);
    		},
    		p(ctx, dirty) {
    			if (dirty & /*page, totalPages*/ 3 && t_value !== (t_value = /*page*/ ctx[0] + '/' + /*totalPages*/ ctx[1] + "")) set_data(t, t_value);
    		},
    		d(detaching) {
    			if (detaching) detach(t);
    		}
    	};
    }

    // (144:16) {#if showinput}
    function create_if_block_1$6(ctx) {
    	let input;
    	let mounted;
    	let dispose;

    	return {
    		c() {
    			input = element("input");
    			attr(input, "type", "text");
    			input.value = /*page*/ ctx[0];
    			attr(input, "class", "form-control");
    		},
    		m(target, anchor) {
    			insert(target, input, anchor);

    			if (!mounted) {
    				dispose = [
    					listen(input, "blur", /*hideInput*/ ctx[6]),
    					listen(input, "change", /*handleChange*/ ctx[8]),
    					action_destroyer(/*init*/ ctx[7].call(null, input)),
    					listen(input, "keydown", stop_propagation(/*keydown_handler*/ ctx[9]))
    				];

    				mounted = true;
    			}
    		},
    		p(ctx, dirty) {
    			if (dirty & /*page*/ 1 && input.value !== /*page*/ ctx[0]) {
    				input.value = /*page*/ ctx[0];
    			}
    		},
    		d(detaching) {
    			if (detaching) detach(input);
    			mounted = false;
    			run_all(dispose);
    		}
    	};
    }

    function create_fragment$t(ctx) {
    	let if_block_anchor;
    	let if_block = /*totalPages*/ ctx[1] > 1 && create_if_block$h(ctx);

    	return {
    		c() {
    			if (if_block) if_block.c();
    			if_block_anchor = empty$1();
    		},
    		m(target, anchor) {
    			if (if_block) if_block.m(target, anchor);
    			insert(target, if_block_anchor, anchor);
    		},
    		p(ctx, [dirty]) {
    			if (/*totalPages*/ ctx[1] > 1) {
    				if (if_block) {
    					if_block.p(ctx, dirty);
    				} else {
    					if_block = create_if_block$h(ctx);
    					if_block.c();
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}
    		},
    		i: noop,
    		o: noop,
    		d(detaching) {
    			if (if_block) if_block.d(detaching);
    			if (detaching) detach(if_block_anchor);
    		}
    	};
    }

    function instance$t($$self, $$props, $$invalidate) {
    	const dispatch = createEventDispatcher();
    	let { page = 1 } = $$props;
    	let { totalPages = 0 } = $$props;
    	let { hideFL = false } = $$props;
    	let showinput = false;

    	const pagerClick = e => {
    		window.localStorage.setItem("selected", 0);
    		let li = e.target;

    		switch (e.target.id) {
    			case "prev-page":
    				{
    					dispatch("gotopage", page - 1);
    					break;
    				}
    			case "next-page":
    				{
    					dispatch("gotopage", page + 1);
    					break;
    				}
    			case "first-page":
    				{
    					dispatch("gotopage", 1);
    					break;
    				}
    			case "last-page":
    				{
    					dispatch("gotopage", totalPages);
    					break;
    				}
    			case "current-page":
    				{
    					paginationInput(li, page, totalPages, dispatch);
    					break;
    				}
    		}
    	};

    	const onShowinput = () => {
    		$$invalidate(3, showinput = true);
    	};

    	const hideInput = () => {
    		$$invalidate(3, showinput = false);
    	};

    	const init = el => {
    		el.focus();
    	};

    	const handleChange = event => {
    		let pg = parseInt(event.target.value);

    		if (!isNaN(pg)) {
    			pg = pg < 1 ? 1 : pg > totalPages ? totalPages : pg;
    			dispatch("gotopage", pg);
    		}
    	};

    	function keydown_handler(event) {
    		bubble.call(this, $$self, event);
    	}

    	$$self.$$set = $$props => {
    		if ('page' in $$props) $$invalidate(0, page = $$props.page);
    		if ('totalPages' in $$props) $$invalidate(1, totalPages = $$props.totalPages);
    		if ('hideFL' in $$props) $$invalidate(2, hideFL = $$props.hideFL);
    	};

    	return [
    		page,
    		totalPages,
    		hideFL,
    		showinput,
    		pagerClick,
    		onShowinput,
    		hideInput,
    		init,
    		handleChange,
    		keydown_handler
    	];
    }

    class Pagination extends SvelteComponent {
    	constructor(options) {
    		super();
    		init(this, options, instance$t, create_fragment$t, safe_not_equal, { page: 0, totalPages: 1, hideFL: 2 });
    	}
    }

    /* src\Admin\Folders\ItemList.svelte generated by Svelte v3.49.0 */

    function get_each_context$9(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[10] = list[i].Id;
    	child_ctx[11] = list[i].Name;
    	child_ctx[12] = list[i].Type;
    	child_ctx[13] = list[i].Path;
    	return child_ctx;
    }

    // (70:12) {:else}
    function create_else_block$8(ctx) {
    	let each_1_anchor;
    	let each_value = /*items*/ ctx[2];
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$9(get_each_context$9(ctx, each_value, i));
    	}

    	return {
    		c() {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			each_1_anchor = empty$1();
    		},
    		m(target, anchor) {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(target, anchor);
    			}

    			insert(target, each_1_anchor, anchor);
    		},
    		p(ctx, dirty) {
    			if (dirty & /*items, folderId*/ 12) {
    				each_value = /*items*/ ctx[2];
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$9(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block$9(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(each_1_anchor.parentNode, each_1_anchor);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}
    		},
    		d(detaching) {
    			destroy_each(each_blocks, detaching);
    			if (detaching) detach(each_1_anchor);
    		}
    	};
    }

    // (68:12) {#if items.length < 1}
    function create_if_block$g(ctx) {
    	let li;
    	let t_value = `Not ${/*title*/ ctx[1]} Found` + "";
    	let t;

    	return {
    		c() {
    			li = element("li");
    			t = text(t_value);
    			attr(li, "class", "list-group-item empty-list svelte-ozw83h");
    		},
    		m(target, anchor) {
    			insert(target, li, anchor);
    			append(li, t);
    		},
    		p(ctx, dirty) {
    			if (dirty & /*title*/ 2 && t_value !== (t_value = `Not ${/*title*/ ctx[1]} Found` + "")) set_data(t, t_value);
    		},
    		d(detaching) {
    			if (detaching) detach(li);
    		}
    	};
    }

    // (78:24) {#if Type.includes('Folder')}
    function create_if_block_1$5(ctx) {
    	let i;

    	return {
    		c() {
    			i = element("i");
    			attr(i, "class", "fas fa-sync svelte-ozw83h");
    		},
    		m(target, anchor) {
    			insert(target, i, anchor);
    		},
    		d(detaching) {
    			if (detaching) detach(i);
    		}
    	};
    }

    // (71:16) {#each items as { Id, Name, Type, Path }}
    function create_each_block$9(ctx) {
    	let li;
    	let show_if = /*Type*/ ctx[12].includes('Folder');
    	let t0;
    	let i0;
    	let t1;
    	let i1;
    	let t2;
    	let t3_value = /*Name*/ ctx[11] + "";
    	let t3;
    	let t4;
    	let li_id_value;
    	let li_title_value;
    	let mounted;
    	let dispose;
    	let if_block = show_if && create_if_block_1$5();

    	return {
    		c() {
    			li = element("li");
    			if (if_block) if_block.c();
    			t0 = space();
    			i0 = element("i");
    			t1 = space();
    			i1 = element("i");
    			t2 = space();
    			t3 = text(t3_value);
    			t4 = space();
    			attr(i0, "class", "fas fa-edit svelte-ozw83h");
    			attr(i1, "class", "fas fa-trash-alt svelte-ozw83h");
    			attr(li, "id", li_id_value = /*Id*/ ctx[10]);
    			attr(li, "title", li_title_value = /*Path*/ ctx[13] || /*Name*/ ctx[11]);
    			attr(li, "class", "list-group-item svelte-ozw83h");
    			toggle_class(li, "active", /*folderId*/ ctx[3] === /*Id*/ ctx[10]);
    		},
    		m(target, anchor) {
    			insert(target, li, anchor);
    			if (if_block) if_block.m(li, null);
    			append(li, t0);
    			append(li, i0);
    			append(li, t1);
    			append(li, i1);
    			append(li, t2);
    			append(li, t3);
    			append(li, t4);

    			if (!mounted) {
    				dispose = listen(li, "click", /*click_handler*/ ctx[7]);
    				mounted = true;
    			}
    		},
    		p(ctx, dirty) {
    			if (dirty & /*items*/ 4) show_if = /*Type*/ ctx[12].includes('Folder');

    			if (show_if) {
    				if (if_block) ; else {
    					if_block = create_if_block_1$5();
    					if_block.c();
    					if_block.m(li, t0);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}

    			if (dirty & /*items*/ 4 && t3_value !== (t3_value = /*Name*/ ctx[11] + "")) set_data(t3, t3_value);

    			if (dirty & /*items*/ 4 && li_id_value !== (li_id_value = /*Id*/ ctx[10])) {
    				attr(li, "id", li_id_value);
    			}

    			if (dirty & /*items*/ 4 && li_title_value !== (li_title_value = /*Path*/ ctx[13] || /*Name*/ ctx[11])) {
    				attr(li, "title", li_title_value);
    			}

    			if (dirty & /*folderId, items*/ 12) {
    				toggle_class(li, "active", /*folderId*/ ctx[3] === /*Id*/ ctx[10]);
    			}
    		},
    		d(detaching) {
    			if (detaching) detach(li);
    			if (if_block) if_block.d();
    			mounted = false;
    			dispose();
    		}
    	};
    }

    function create_fragment$s(ctx) {
    	let div3;
    	let div0;
    	let filter_1;
    	let t0;
    	let h4;
    	let t1_value = `${/*totalItems*/ ctx[6]} - ${/*title*/ ctx[1]}` + "";
    	let t1;
    	let t2;
    	let div1;
    	let ul;
    	let t3;
    	let div2;
    	let pagination;
    	let current;
    	filter_1 = new Filter({ props: { filter: /*filter*/ ctx[0] } });
    	filter_1.$on("filter", /*filter_handler*/ ctx[8]);

    	function select_block_type(ctx, dirty) {
    		if (/*items*/ ctx[2].length < 1) return create_if_block$g;
    		return create_else_block$8;
    	}

    	let current_block_type = select_block_type(ctx);
    	let if_block = current_block_type(ctx);

    	pagination = new Pagination({
    			props: {
    				page: /*page*/ ctx[4],
    				totalPages: /*totalPages*/ ctx[5]
    			}
    		});

    	pagination.$on("gotopage", /*gotopage_handler*/ ctx[9]);

    	return {
    		c() {
    			div3 = element("div");
    			div0 = element("div");
    			create_component(filter_1.$$.fragment);
    			t0 = space();
    			h4 = element("h4");
    			t1 = text(t1_value);
    			t2 = space();
    			div1 = element("div");
    			ul = element("ul");
    			if_block.c();
    			t3 = space();
    			div2 = element("div");
    			create_component(pagination.$$.fragment);
    			attr(h4, "class", "text-center svelte-ozw83h");
    			attr(div0, "class", "controls svelte-ozw83h");
    			attr(ul, "class", "list-group text-dark");
    			attr(div1, "class", "list-container svelte-ozw83h");
    			attr(div2, "class", "list-controls svelte-ozw83h");
    			attr(div3, "id", /*title*/ ctx[1]);
    			attr(div3, "class", "file-list col-6 svelte-ozw83h");
    		},
    		m(target, anchor) {
    			insert(target, div3, anchor);
    			append(div3, div0);
    			mount_component(filter_1, div0, null);
    			append(div0, t0);
    			append(div0, h4);
    			append(h4, t1);
    			append(div3, t2);
    			append(div3, div1);
    			append(div1, ul);
    			if_block.m(ul, null);
    			append(div3, t3);
    			append(div3, div2);
    			mount_component(pagination, div2, null);
    			current = true;
    		},
    		p(ctx, [dirty]) {
    			const filter_1_changes = {};
    			if (dirty & /*filter*/ 1) filter_1_changes.filter = /*filter*/ ctx[0];
    			filter_1.$set(filter_1_changes);
    			if ((!current || dirty & /*totalItems, title*/ 66) && t1_value !== (t1_value = `${/*totalItems*/ ctx[6]} - ${/*title*/ ctx[1]}` + "")) set_data(t1, t1_value);

    			if (current_block_type === (current_block_type = select_block_type(ctx)) && if_block) {
    				if_block.p(ctx, dirty);
    			} else {
    				if_block.d(1);
    				if_block = current_block_type(ctx);

    				if (if_block) {
    					if_block.c();
    					if_block.m(ul, null);
    				}
    			}

    			const pagination_changes = {};
    			if (dirty & /*page*/ 16) pagination_changes.page = /*page*/ ctx[4];
    			if (dirty & /*totalPages*/ 32) pagination_changes.totalPages = /*totalPages*/ ctx[5];
    			pagination.$set(pagination_changes);

    			if (!current || dirty & /*title*/ 2) {
    				attr(div3, "id", /*title*/ ctx[1]);
    			}
    		},
    		i(local) {
    			if (current) return;
    			transition_in(filter_1.$$.fragment, local);
    			transition_in(pagination.$$.fragment, local);
    			current = true;
    		},
    		o(local) {
    			transition_out(filter_1.$$.fragment, local);
    			transition_out(pagination.$$.fragment, local);
    			current = false;
    		},
    		d(detaching) {
    			if (detaching) detach(div3);
    			destroy_component(filter_1);
    			if_block.d();
    			destroy_component(pagination);
    		}
    	};
    }

    function instance$s($$self, $$props, $$invalidate) {
    	let { filter } = $$props;
    	let { title } = $$props;
    	let { items } = $$props;
    	let { folderId } = $$props;
    	let { page = 1 } = $$props;
    	let { totalPages = 0 } = $$props;
    	let { totalItems = 0 } = $$props;

    	function click_handler(event) {
    		bubble.call(this, $$self, event);
    	}

    	function filter_handler(event) {
    		bubble.call(this, $$self, event);
    	}

    	function gotopage_handler(event) {
    		bubble.call(this, $$self, event);
    	}

    	$$self.$$set = $$props => {
    		if ('filter' in $$props) $$invalidate(0, filter = $$props.filter);
    		if ('title' in $$props) $$invalidate(1, title = $$props.title);
    		if ('items' in $$props) $$invalidate(2, items = $$props.items);
    		if ('folderId' in $$props) $$invalidate(3, folderId = $$props.folderId);
    		if ('page' in $$props) $$invalidate(4, page = $$props.page);
    		if ('totalPages' in $$props) $$invalidate(5, totalPages = $$props.totalPages);
    		if ('totalItems' in $$props) $$invalidate(6, totalItems = $$props.totalItems);
    	};

    	return [
    		filter,
    		title,
    		items,
    		folderId,
    		page,
    		totalPages,
    		totalItems,
    		click_handler,
    		filter_handler,
    		gotopage_handler
    	];
    }

    class ItemList extends SvelteComponent {
    	constructor(options) {
    		super();

    		init(this, options, instance$s, create_fragment$s, safe_not_equal, {
    			filter: 0,
    			title: 1,
    			items: 2,
    			folderId: 3,
    			page: 4,
    			totalPages: 5,
    			totalItems: 6
    		});
    	}
    }

    /* src\Admin\Folders\Modal.svelte generated by Svelte v3.49.0 */

    function create_else_block$7(ctx) {
    	let p;
    	let t0;
    	let strong;
    	let t1_value = /*file*/ ctx[0].Name + "";
    	let t1;
    	let t2;
    	let div1;

    	return {
    		c() {
    			p = element("p");
    			t0 = text("Are you sure you want to remove ");
    			strong = element("strong");
    			t1 = text(t1_value);
    			t2 = space();
    			div1 = element("div");

    			div1.innerHTML = `<div class="input-group-prepend"><label for="sysdel" class="input-group-text del-label svelte-h81hyi">Delete From System</label></div> 
            <input id="sysdel" type="checkbox" class="svelte-h81hyi"/> 
            <label for="sysdel" class="form-control svelte-h81hyi"><i class="fas fa-times svelte-h81hyi"></i></label>`;

    			attr(strong, "class", "svelte-h81hyi");
    			attr(div1, "class", "input-group");
    		},
    		m(target, anchor) {
    			insert(target, p, anchor);
    			append(p, t0);
    			append(p, strong);
    			append(strong, t1);
    			insert(target, t2, anchor);
    			insert(target, div1, anchor);
    		},
    		p(ctx, dirty) {
    			if (dirty & /*file*/ 1 && t1_value !== (t1_value = /*file*/ ctx[0].Name + "")) set_data(t1, t1_value);
    		},
    		d(detaching) {
    			if (detaching) detach(p);
    			if (detaching) detach(t2);
    			if (detaching) detach(div1);
    		}
    	};
    }

    // (14:8) {#if !modalType.Del}
    function create_if_block$f(ctx) {
    	let div1;
    	let div0;
    	let t1;
    	let input;
    	let input_value_value;

    	return {
    		c() {
    			div1 = element("div");
    			div0 = element("div");
    			div0.innerHTML = `<label for="Name" class="input-group-text svelte-h81hyi">Name</label>`;
    			t1 = space();
    			input = element("input");
    			attr(div0, "class", "input-group-prepend");
    			attr(input, "type", "text");
    			attr(input, "name", "Name");
    			attr(input, "class", "form-control");
    			input.value = input_value_value = /*file*/ ctx[0].Name;
    			attr(div1, "class", "input-group");
    		},
    		m(target, anchor) {
    			insert(target, div1, anchor);
    			append(div1, div0);
    			append(div1, t1);
    			append(div1, input);
    		},
    		p(ctx, dirty) {
    			if (dirty & /*file*/ 1 && input_value_value !== (input_value_value = /*file*/ ctx[0].Name) && input.value !== input_value_value) {
    				input.value = input_value_value;
    			}
    		},
    		d(detaching) {
    			if (detaching) detach(div1);
    		}
    	};
    }

    function create_fragment$r(ctx) {
    	let div5;
    	let div4;
    	let div0;
    	let h3;
    	let t0_value = /*modalType*/ ctx[1].title + "";
    	let t0;
    	let t1;
    	let form;
    	let div1;
    	let t2;
    	let div2;
    	let t3_value = (/*modalType*/ ctx[1].error || "") + "";
    	let t3;
    	let t4;
    	let div3;
    	let button0;
    	let t6;
    	let button1;
    	let t7_value = (/*modalType*/ ctx[1].Del ? "Remove" : "Update") + "";
    	let t7;
    	let div4_transition;
    	let current;
    	let mounted;
    	let dispose;

    	function select_block_type(ctx, dirty) {
    		if (!/*modalType*/ ctx[1].Del) return create_if_block$f;
    		return create_else_block$7;
    	}

    	let current_block_type = select_block_type(ctx);
    	let if_block = current_block_type(ctx);

    	return {
    		c() {
    			div5 = element("div");
    			div4 = element("div");
    			div0 = element("div");
    			h3 = element("h3");
    			t0 = text(t0_value);
    			t1 = space();
    			form = element("form");
    			div1 = element("div");
    			if_block.c();
    			t2 = space();
    			div2 = element("div");
    			t3 = text(t3_value);
    			t4 = space();
    			div3 = element("div");
    			button0 = element("button");
    			button0.textContent = "Cancel";
    			t6 = space();
    			button1 = element("button");
    			t7 = text(t7_value);
    			attr(div0, "class", "modal-header");
    			attr(div1, "class", "modal-body");
    			attr(div2, "class", "error svelte-h81hyi");
    			attr(button0, "type", "button");
    			attr(button0, "class", "btn");
    			attr(button1, "type", "submit");
    			attr(button1, "class", "btn");
    			attr(div3, "class", "modal-footer");
    			attr(form, "action", "#");
    			attr(div4, "class", "modal card");
    			attr(div5, "class", "modal-container");
    		},
    		m(target, anchor) {
    			insert(target, div5, anchor);
    			append(div5, div4);
    			append(div4, div0);
    			append(div0, h3);
    			append(h3, t0);
    			append(div4, t1);
    			append(div4, form);
    			append(form, div1);
    			if_block.m(div1, null);
    			append(form, t2);
    			append(form, div2);
    			append(div2, t3);
    			append(form, t4);
    			append(form, div3);
    			append(div3, button0);
    			append(div3, t6);
    			append(div3, button1);
    			append(button1, t7);
    			current = true;

    			if (!mounted) {
    				dispose = [
    					listen(button0, "click", /*click_handler*/ ctx[3]),
    					listen(form, "submit", prevent_default(/*submit_handler*/ ctx[2]))
    				];

    				mounted = true;
    			}
    		},
    		p(ctx, [dirty]) {
    			if ((!current || dirty & /*modalType*/ 2) && t0_value !== (t0_value = /*modalType*/ ctx[1].title + "")) set_data(t0, t0_value);

    			if (current_block_type === (current_block_type = select_block_type(ctx)) && if_block) {
    				if_block.p(ctx, dirty);
    			} else {
    				if_block.d(1);
    				if_block = current_block_type(ctx);

    				if (if_block) {
    					if_block.c();
    					if_block.m(div1, null);
    				}
    			}

    			if ((!current || dirty & /*modalType*/ 2) && t3_value !== (t3_value = (/*modalType*/ ctx[1].error || "") + "")) set_data(t3, t3_value);
    			if ((!current || dirty & /*modalType*/ 2) && t7_value !== (t7_value = (/*modalType*/ ctx[1].Del ? "Remove" : "Update") + "")) set_data(t7, t7_value);
    		},
    		i(local) {
    			if (current) return;

    			add_render_callback(() => {
    				if (!div4_transition) div4_transition = create_bidirectional_transition(div4, fade, { duration: 200 }, true);
    				div4_transition.run(1);
    			});

    			current = true;
    		},
    		o(local) {
    			if (!div4_transition) div4_transition = create_bidirectional_transition(div4, fade, { duration: 200 }, false);
    			div4_transition.run(0);
    			current = false;
    		},
    		d(detaching) {
    			if (detaching) detach(div5);
    			if_block.d();
    			if (detaching && div4_transition) div4_transition.end();
    			mounted = false;
    			run_all(dispose);
    		}
    	};
    }

    function instance$r($$self, $$props, $$invalidate) {
    	let { file } = $$props;
    	let { modalType } = $$props;

    	function submit_handler(event) {
    		bubble.call(this, $$self, event);
    	}

    	function click_handler(event) {
    		bubble.call(this, $$self, event);
    	}

    	$$self.$$set = $$props => {
    		if ('file' in $$props) $$invalidate(0, file = $$props.file);
    		if ('modalType' in $$props) $$invalidate(1, modalType = $$props.modalType);
    	};

    	return [file, modalType, submit_handler, click_handler];
    }

    class Modal extends SvelteComponent {
    	constructor(options) {
    		super();
    		init(this, options, instance$r, create_fragment$r, safe_not_equal, { file: 0, modalType: 1 });
    	}
    }

    /* src\Admin\Folders\FoldersList.svelte generated by Svelte v3.49.0 */

    function create_if_block$e(ctx) {
    	let modal;
    	let current;

    	modal = new Modal({
    			props: {
    				file: /*folder*/ ctx[6],
    				modalType: /*modalType*/ ctx[8]
    			}
    		});

    	modal.$on("submit", /*handleSubmit*/ ctx[12]);
    	modal.$on("click", /*hideModal*/ ctx[13]);

    	return {
    		c() {
    			create_component(modal.$$.fragment);
    		},
    		m(target, anchor) {
    			mount_component(modal, target, anchor);
    			current = true;
    		},
    		p(ctx, dirty) {
    			const modal_changes = {};
    			if (dirty & /*folder*/ 64) modal_changes.file = /*folder*/ ctx[6];
    			if (dirty & /*modalType*/ 256) modal_changes.modalType = /*modalType*/ ctx[8];
    			modal.$set(modal_changes);
    		},
    		i(local) {
    			if (current) return;
    			transition_in(modal.$$.fragment, local);
    			current = true;
    		},
    		o(local) {
    			transition_out(modal.$$.fragment, local);
    			current = false;
    		},
    		d(detaching) {
    			destroy_component(modal, detaching);
    		}
    	};
    }

    function create_fragment$q(ctx) {
    	let t;
    	let itemlist;
    	let current;
    	let if_block = /*showModal*/ ctx[7] && create_if_block$e(ctx);

    	itemlist = new ItemList({
    			props: {
    				title: "Folders",
    				folderId: /*folderId*/ ctx[2],
    				items: /*items*/ ctx[5],
    				page: /*page*/ ctx[0],
    				totalPages: /*totalPages*/ ctx[3],
    				totalItems: /*totalItems*/ ctx[4],
    				filter: /*filter*/ ctx[1]
    			}
    		});

    	itemlist.$on("filter", /*onFilter*/ ctx[9]);
    	itemlist.$on("gotopage", /*gotopage*/ ctx[10]);
    	itemlist.$on("click", /*itemClick*/ ctx[11]);

    	return {
    		c() {
    			if (if_block) if_block.c();
    			t = space();
    			create_component(itemlist.$$.fragment);
    		},
    		m(target, anchor) {
    			if (if_block) if_block.m(target, anchor);
    			insert(target, t, anchor);
    			mount_component(itemlist, target, anchor);
    			current = true;
    		},
    		p(ctx, [dirty]) {
    			if (/*showModal*/ ctx[7]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);

    					if (dirty & /*showModal*/ 128) {
    						transition_in(if_block, 1);
    					}
    				} else {
    					if_block = create_if_block$e(ctx);
    					if_block.c();
    					transition_in(if_block, 1);
    					if_block.m(t.parentNode, t);
    				}
    			} else if (if_block) {
    				group_outros();

    				transition_out(if_block, 1, 1, () => {
    					if_block = null;
    				});

    				check_outros();
    			}

    			const itemlist_changes = {};
    			if (dirty & /*folderId*/ 4) itemlist_changes.folderId = /*folderId*/ ctx[2];
    			if (dirty & /*items*/ 32) itemlist_changes.items = /*items*/ ctx[5];
    			if (dirty & /*page*/ 1) itemlist_changes.page = /*page*/ ctx[0];
    			if (dirty & /*totalPages*/ 8) itemlist_changes.totalPages = /*totalPages*/ ctx[3];
    			if (dirty & /*totalItems*/ 16) itemlist_changes.totalItems = /*totalItems*/ ctx[4];
    			if (dirty & /*filter*/ 2) itemlist_changes.filter = /*filter*/ ctx[1];
    			itemlist.$set(itemlist_changes);
    		},
    		i(local) {
    			if (current) return;
    			transition_in(if_block);
    			transition_in(itemlist.$$.fragment, local);
    			current = true;
    		},
    		o(local) {
    			transition_out(if_block);
    			transition_out(itemlist.$$.fragment, local);
    			current = false;
    		},
    		d(detaching) {
    			if (if_block) if_block.d(detaching);
    			if (detaching) detach(t);
    			destroy_component(itemlist, detaching);
    		}
    	};
    }

    function instance$q($$self, $$props, $$invalidate) {
    	const dispatch = createEventDispatcher();
    	const socket = getContext("socket");
    	let { page = 1 } = $$props;
    	let { filter = "" } = $$props;
    	let { folderId } = $$props;
    	let totalPages = 1;
    	let totalItems = 0;
    	let items = [];
    	let folder = {};
    	let showModal = false;
    	let modalType = {};

    	const loadFolders = async pg => {
    		let { data } = await axios.get(`/api/admin/folders/${pg}/${calRows()}/${filter || ""}`);

    		if (data.folders) {
    			let tmp = data.folders[0];
    			$$invalidate(2, folderId = tmp ? tmp.Id : "");
    			$$invalidate(5, items = data.folders);
    			$$invalidate(3, totalPages = data.totalPages);
    			$$invalidate(4, totalItems = data.totalItems);
    			$$invalidate(0, page = pg);
    			dispatch("folderid", folderId);
    			navigate(`/folders/${pg}/${filter || ""}`);
    		}
    	};

    	onMount(() => {
    		loadFolders(page);

    		socket.on("folder-renamed", data => {
    			if (data.success) {
    				$$invalidate(6, folder.Name = data.Name, folder);
    				$$invalidate(5, items);
    				hideModal();
    			}
    		});

    		socket.on("folder-removed", data => {
    			if (data.success) {
    				loadFolders(page);
    				hideModal();
    			}
    		});
    	});

    	onDestroy(() => {
    		delete socket._callbacks["$folder-renamed"];
    		delete socket._callbacks["$folder-removed"];
    	});

    	const onFilter = flt => {
    		$$invalidate(1, filter = flt.detail);
    		loadFolders(1);
    	};

    	const gotopage = pg => {
    		pg = parseInt(pg.detail);
    		if (pg < 1 || pg > totalPages) return;
    		loadFolders(clamp(pg, 1, totalPages));
    	};

    	const itemClick = ({ target }) => {
    		let el = target;

    		if (el.tagName === "LI") {
    			$$invalidate(2, folderId = el.id);
    			dispatch("folderid", folderId);
    		} else {
    			$$invalidate(6, folder = items.find(f => f.Id === el.closest("li").id));
    			let cList = el.classList.toString();

    			if ((/fa-edit/gi).test(cList)) {
    				$$invalidate(8, modalType = { title: "Edit Folder", Del: false });
    				$$invalidate(7, showModal = true);
    			} else if ((/fa-trash-alt/gi).test(cList)) {
    				$$invalidate(8, modalType = { title: "Remove Folder", Del: true });
    				$$invalidate(7, showModal = true);
    			} else {
    				socket.emit("scan-dir", { Id: folder.Id, isFolder: true });
    			}
    		}
    	};

    	const handleSubmit = event => {
    		//if we are deleting the file
    		if (modalType.Del) {
    			let Del = event.target.querySelector("input").checked;
    			socket.emit("remove-folder", { Id: folder.Id, Del });
    		} else {
    			let Name = event.target.querySelector("input").value;

    			if (!Name) {
    				$$invalidate(8, modalType.error = "Name Can't be empty", modalType);
    			} else {
    				socket.emit("rename-folder", { Id: folder.Id, Name });
    			}
    		}
    	};

    	const hideModal = () => {
    		$$invalidate(7, showModal = false);
    		$$invalidate(6, folder = {});
    	};

    	$$self.$$set = $$props => {
    		if ('page' in $$props) $$invalidate(0, page = $$props.page);
    		if ('filter' in $$props) $$invalidate(1, filter = $$props.filter);
    		if ('folderId' in $$props) $$invalidate(2, folderId = $$props.folderId);
    	};

    	return [
    		page,
    		filter,
    		folderId,
    		totalPages,
    		totalItems,
    		items,
    		folder,
    		showModal,
    		modalType,
    		onFilter,
    		gotopage,
    		itemClick,
    		handleSubmit,
    		hideModal
    	];
    }

    class FoldersList extends SvelteComponent {
    	constructor(options) {
    		super();
    		init(this, options, instance$q, create_fragment$q, safe_not_equal, { page: 0, filter: 1, folderId: 2 });
    	}
    }

    /* src\Admin\Folders\FilesList.svelte generated by Svelte v3.49.0 */

    function create_if_block$d(ctx) {
    	let modal;
    	let current;

    	modal = new Modal({
    			props: {
    				file: /*file*/ ctx[5],
    				modalType: /*modalType*/ ctx[7]
    			}
    		});

    	modal.$on("submit", /*handleSubmit*/ ctx[11]);
    	modal.$on("click", /*hideModal*/ ctx[12]);

    	return {
    		c() {
    			create_component(modal.$$.fragment);
    		},
    		m(target, anchor) {
    			mount_component(modal, target, anchor);
    			current = true;
    		},
    		p(ctx, dirty) {
    			const modal_changes = {};
    			if (dirty & /*file*/ 32) modal_changes.file = /*file*/ ctx[5];
    			if (dirty & /*modalType*/ 128) modal_changes.modalType = /*modalType*/ ctx[7];
    			modal.$set(modal_changes);
    		},
    		i(local) {
    			if (current) return;
    			transition_in(modal.$$.fragment, local);
    			current = true;
    		},
    		o(local) {
    			transition_out(modal.$$.fragment, local);
    			current = false;
    		},
    		d(detaching) {
    			destroy_component(modal, detaching);
    		}
    	};
    }

    function create_fragment$p(ctx) {
    	let t;
    	let itemlist;
    	let current;
    	let if_block = /*showModal*/ ctx[6] && create_if_block$d(ctx);

    	itemlist = new ItemList({
    			props: {
    				title: "Files",
    				folderId: "",
    				items: /*items*/ ctx[4],
    				page: /*page*/ ctx[0],
    				totalPages: /*totalPages*/ ctx[1],
    				totalItems: /*totalItems*/ ctx[2],
    				filter: /*filter*/ ctx[3]
    			}
    		});

    	itemlist.$on("filter", /*onFilter*/ ctx[8]);
    	itemlist.$on("gotopage", /*goToPage*/ ctx[9]);
    	itemlist.$on("click", /*itemClick*/ ctx[10]);

    	return {
    		c() {
    			if (if_block) if_block.c();
    			t = space();
    			create_component(itemlist.$$.fragment);
    		},
    		m(target, anchor) {
    			if (if_block) if_block.m(target, anchor);
    			insert(target, t, anchor);
    			mount_component(itemlist, target, anchor);
    			current = true;
    		},
    		p(ctx, [dirty]) {
    			if (/*showModal*/ ctx[6]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);

    					if (dirty & /*showModal*/ 64) {
    						transition_in(if_block, 1);
    					}
    				} else {
    					if_block = create_if_block$d(ctx);
    					if_block.c();
    					transition_in(if_block, 1);
    					if_block.m(t.parentNode, t);
    				}
    			} else if (if_block) {
    				group_outros();

    				transition_out(if_block, 1, 1, () => {
    					if_block = null;
    				});

    				check_outros();
    			}

    			const itemlist_changes = {};
    			if (dirty & /*items*/ 16) itemlist_changes.items = /*items*/ ctx[4];
    			if (dirty & /*page*/ 1) itemlist_changes.page = /*page*/ ctx[0];
    			if (dirty & /*totalPages*/ 2) itemlist_changes.totalPages = /*totalPages*/ ctx[1];
    			if (dirty & /*totalItems*/ 4) itemlist_changes.totalItems = /*totalItems*/ ctx[2];
    			if (dirty & /*filter*/ 8) itemlist_changes.filter = /*filter*/ ctx[3];
    			itemlist.$set(itemlist_changes);
    		},
    		i(local) {
    			if (current) return;
    			transition_in(if_block);
    			transition_in(itemlist.$$.fragment, local);
    			current = true;
    		},
    		o(local) {
    			transition_out(if_block);
    			transition_out(itemlist.$$.fragment, local);
    			current = false;
    		},
    		d(detaching) {
    			if (if_block) if_block.d(detaching);
    			if (detaching) detach(t);
    			destroy_component(itemlist, detaching);
    		}
    	};
    }

    function instance$p($$self, $$props, $$invalidate) {
    	const socket = getContext("socket");
    	let { folderId } = $$props;
    	let oldFolder = folderId;
    	let page = 1;
    	let totalPages;
    	let totalItems;
    	let filter = "";
    	let items = [];
    	let file = {};
    	let showModal = false;
    	let modalType = {};

    	const loadFiles = async pg => {
    		let rows = calRows();
    		let { data } = await axios.get(`/api/admin/folders/files/${folderId}/${pg}/${rows}/${filter || ""}`);

    		if (data.files) {
    			$$invalidate(4, items = data.files);
    			$$invalidate(1, totalPages = data.totalPages);
    			$$invalidate(2, totalItems = data.totalItems);
    			$$invalidate(0, page = pg);
    		}
    	};

    	onMount(async () => {
    		loadFiles(1);

    		socket.on("file-renamed", data => {
    			if (data.success) {
    				$$invalidate(5, file.Name = data.Name, file);
    				$$invalidate(4, items);
    				hideModal();
    			}
    		});

    		socket.on("file-removed", data => {
    			if (data.success) {
    				if (page === totalPages && items.length > 1) {
    					$$invalidate(4, items = items.filter(f => f.Id !== file.Id));
    				} else {
    					$$invalidate(0, page = page > 1 ? page - 1 : page);
    					loadFiles(page);
    				}

    				hideModal();
    			}
    		});
    	});

    	onDestroy(() => {
    		delete socket._callbacks["$file-renamed"];
    		delete socket._callbacks["$file-removed"];
    	});

    	const onFilter = event => {
    		$$invalidate(3, filter = event.detail);
    		loadFiles(1);
    	};

    	const goToPage = pg => {
    		pg = parseInt(pg.detail);
    		if (pg < 1 || pg > totalPages) return;
    		$$invalidate(0, page = pg < 1 ? 1 : pg > totalPages ? totalPages : pg);
    		loadFiles(page);
    	};

    	const itemClick = event => {
    		let el = event.target;

    		if (el.tagName !== "LI") {
    			$$invalidate(5, file = items.find(f => f.Id === el.closest("li").id));
    			let cList = el.classList.toString();

    			//Edit button was clicked
    			if ((/fa-edit/gi).test(cList)) {
    				$$invalidate(7, modalType = {
    					title: "Edit File",
    					Del: false,
    					isFile: true
    				});
    			} else //Delete button was clicked
    			{
    				$$invalidate(7, modalType = {
    					title: "Remove File",
    					Del: true,
    					isFile: true
    				});
    			}

    			$$invalidate(6, showModal = true);
    		}
    	};

    	const handleSubmit = event => {
    		if (modalType.Del) {
    			let Del = event.target.querySelector("input").checked;
    			socket.emit("remove-file", { Id: file.Id, Del });
    		} else {
    			let Name = event.target.querySelector("input").value;

    			if (!Name) {
    				$$invalidate(7, modalType.error = "Name Can't be empty", modalType);
    			} else {
    				socket.emit("rename-file", { Id: file.Id, Name });
    			}
    		}
    	};

    	const hideModal = () => {
    		$$invalidate(6, showModal = false);
    		$$invalidate(5, file = {});
    	};

    	$$self.$$set = $$props => {
    		if ('folderId' in $$props) $$invalidate(13, folderId = $$props.folderId);
    	};

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*folderId*/ 8192) {
    			if (folderId !== oldFolder) {
    				loadFiles(1);
    			}
    		}
    	};

    	return [
    		page,
    		totalPages,
    		totalItems,
    		filter,
    		items,
    		file,
    		showModal,
    		modalType,
    		onFilter,
    		goToPage,
    		itemClick,
    		handleSubmit,
    		hideModal,
    		folderId
    	];
    }

    class FilesList$1 extends SvelteComponent {
    	constructor(options) {
    		super();
    		init(this, options, instance$p, create_fragment$p, safe_not_equal, { folderId: 13 });
    	}
    }

    /* src\Admin\Folders\Folders.svelte generated by Svelte v3.49.0 */

    function create_fragment$o(ctx) {
    	let div1;
    	let div0;
    	let folderlist;
    	let t;
    	let fileslist;
    	let current;

    	folderlist = new FoldersList({
    			props: {
    				page: parseInt(/*page*/ ctx[1]) || 1,
    				folderId: /*folderId*/ ctx[0],
    				filter: /*filter*/ ctx[2]
    			}
    		});

    	folderlist.$on("folderid", /*folderid*/ ctx[3]);
    	fileslist = new FilesList$1({ props: { folderId: /*folderId*/ ctx[0] } });

    	return {
    		c() {
    			div1 = element("div");
    			div0 = element("div");
    			create_component(folderlist.$$.fragment);
    			t = space();
    			create_component(fileslist.$$.fragment);
    			attr(div0, "class", "rows svelte-1digf97");
    			attr(div1, "class", "card bg-dark admin-manager  svelte-1digf97");
    		},
    		m(target, anchor) {
    			insert(target, div1, anchor);
    			append(div1, div0);
    			mount_component(folderlist, div0, null);
    			append(div0, t);
    			mount_component(fileslist, div0, null);
    			current = true;
    		},
    		p(ctx, [dirty]) {
    			const folderlist_changes = {};
    			if (dirty & /*page*/ 2) folderlist_changes.page = parseInt(/*page*/ ctx[1]) || 1;
    			if (dirty & /*folderId*/ 1) folderlist_changes.folderId = /*folderId*/ ctx[0];
    			if (dirty & /*filter*/ 4) folderlist_changes.filter = /*filter*/ ctx[2];
    			folderlist.$set(folderlist_changes);
    			const fileslist_changes = {};
    			if (dirty & /*folderId*/ 1) fileslist_changes.folderId = /*folderId*/ ctx[0];
    			fileslist.$set(fileslist_changes);
    		},
    		i(local) {
    			if (current) return;
    			transition_in(folderlist.$$.fragment, local);
    			transition_in(fileslist.$$.fragment, local);
    			current = true;
    		},
    		o(local) {
    			transition_out(folderlist.$$.fragment, local);
    			transition_out(fileslist.$$.fragment, local);
    			current = false;
    		},
    		d(detaching) {
    			if (detaching) detach(div1);
    			destroy_component(folderlist);
    			destroy_component(fileslist);
    		}
    	};
    }

    function instance$o($$self, $$props, $$invalidate) {
    	let { page } = $$props;
    	let { filter } = $$props;
    	let { folderId } = $$props;

    	const folderid = event => {
    		$$invalidate(0, folderId = event.detail);
    	};

    	$$self.$$set = $$props => {
    		if ('page' in $$props) $$invalidate(1, page = $$props.page);
    		if ('filter' in $$props) $$invalidate(2, filter = $$props.filter);
    		if ('folderId' in $$props) $$invalidate(0, folderId = $$props.folderId);
    	};

    	return [folderId, page, filter, folderid];
    }

    class Folders extends SvelteComponent {
    	constructor(options) {
    		super();
    		init(this, options, instance$o, create_fragment$o, safe_not_equal, { page: 1, filter: 2, folderId: 0 });
    	}
    }

    /* src\Admin\Disks\TreeItem.svelte generated by Svelte v3.49.0 */

    function get_each_context$8(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[8] = list[i].Content;
    	child_ctx[9] = list[i].Id;
    	child_ctx[10] = list[i].Name;
    	return child_ctx;
    }

    // (93:4) {#if Content.length > 0}
    function create_if_block$c(ctx) {
    	let ul;
    	let treeitem;
    	let current;

    	treeitem = new TreeItem({
    			props: {
    				type: "folder",
    				items: /*Content*/ ctx[8]
    			}
    		});

    	treeitem.$on("scanDir", /*scanDir_handler*/ ctx[4]);

    	return {
    		c() {
    			ul = element("ul");
    			create_component(treeitem.$$.fragment);
    			attr(ul, "class", "tree-node svelte-jlzmny");
    		},
    		m(target, anchor) {
    			insert(target, ul, anchor);
    			mount_component(treeitem, ul, null);
    			current = true;
    		},
    		p(ctx, dirty) {
    			const treeitem_changes = {};
    			if (dirty & /*items*/ 1) treeitem_changes.items = /*Content*/ ctx[8];
    			treeitem.$set(treeitem_changes);
    		},
    		i(local) {
    			if (current) return;
    			transition_in(treeitem.$$.fragment, local);
    			current = true;
    		},
    		o(local) {
    			transition_out(treeitem.$$.fragment, local);
    			current = false;
    		},
    		d(detaching) {
    			if (detaching) detach(ul);
    			destroy_component(treeitem);
    		}
    	};
    }

    // (86:0) {#each items as { Content, Id, Name }}
    function create_each_block$8(ctx) {
    	let li;
    	let span0;
    	let i;
    	let i_class_value;
    	let t0;
    	let t1_value = /*Name*/ ctx[10] + "";
    	let t1;
    	let t2;
    	let span1;
    	let t4;
    	let t5;
    	let li_id_value;
    	let current;
    	let mounted;
    	let dispose;
    	let if_block = /*Content*/ ctx[8].length > 0 && create_if_block$c(ctx);

    	return {
    		c() {
    			li = element("li");
    			span0 = element("span");
    			i = element("i");
    			t0 = space();
    			t1 = text(t1_value);
    			t2 = space();
    			span1 = element("span");
    			span1.textContent = "▶";
    			t4 = space();
    			if (if_block) if_block.c();
    			t5 = space();
    			attr(i, "class", i_class_value = "" + (null_to_empty(`fa fa-${/*type*/ ctx[1]} mr-1`) + " svelte-jlzmny"));
    			attr(span0, "class", "dir svelte-jlzmny");
    			attr(span1, "class", "caret svelte-jlzmny");
    			attr(li, "id", li_id_value = /*Id*/ ctx[9]);
    			attr(li, "class", "tree-item svelte-jlzmny");
    		},
    		m(target, anchor) {
    			insert(target, li, anchor);
    			append(li, span0);
    			append(span0, i);
    			append(span0, t0);
    			append(span0, t1);
    			append(li, t2);
    			append(li, span1);
    			append(li, t4);
    			if (if_block) if_block.m(li, null);
    			append(li, t5);
    			current = true;

    			if (!mounted) {
    				dispose = [
    					listen(span0, "click", /*scanDirectory*/ ctx[3]),
    					listen(span1, "click", /*expandFolder*/ ctx[2])
    				];

    				mounted = true;
    			}
    		},
    		p(ctx, dirty) {
    			if (!current || dirty & /*type*/ 2 && i_class_value !== (i_class_value = "" + (null_to_empty(`fa fa-${/*type*/ ctx[1]} mr-1`) + " svelte-jlzmny"))) {
    				attr(i, "class", i_class_value);
    			}

    			if ((!current || dirty & /*items*/ 1) && t1_value !== (t1_value = /*Name*/ ctx[10] + "")) set_data(t1, t1_value);

    			if (/*Content*/ ctx[8].length > 0) {
    				if (if_block) {
    					if_block.p(ctx, dirty);

    					if (dirty & /*items*/ 1) {
    						transition_in(if_block, 1);
    					}
    				} else {
    					if_block = create_if_block$c(ctx);
    					if_block.c();
    					transition_in(if_block, 1);
    					if_block.m(li, t5);
    				}
    			} else if (if_block) {
    				group_outros();

    				transition_out(if_block, 1, 1, () => {
    					if_block = null;
    				});

    				check_outros();
    			}

    			if (!current || dirty & /*items*/ 1 && li_id_value !== (li_id_value = /*Id*/ ctx[9])) {
    				attr(li, "id", li_id_value);
    			}
    		},
    		i(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d(detaching) {
    			if (detaching) detach(li);
    			if (if_block) if_block.d();
    			mounted = false;
    			run_all(dispose);
    		}
    	};
    }

    function create_fragment$n(ctx) {
    	let each_1_anchor;
    	let current;
    	let each_value = /*items*/ ctx[0];
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$8(get_each_context$8(ctx, each_value, i));
    	}

    	const out = i => transition_out(each_blocks[i], 1, 1, () => {
    		each_blocks[i] = null;
    	});

    	return {
    		c() {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			each_1_anchor = empty$1();
    		},
    		m(target, anchor) {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(target, anchor);
    			}

    			insert(target, each_1_anchor, anchor);
    			current = true;
    		},
    		p(ctx, [dirty]) {
    			if (dirty & /*items, expandFolder, scanDirectory, type*/ 15) {
    				each_value = /*items*/ ctx[0];
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$8(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    						transition_in(each_blocks[i], 1);
    					} else {
    						each_blocks[i] = create_each_block$8(child_ctx);
    						each_blocks[i].c();
    						transition_in(each_blocks[i], 1);
    						each_blocks[i].m(each_1_anchor.parentNode, each_1_anchor);
    					}
    				}

    				group_outros();

    				for (i = each_value.length; i < each_blocks.length; i += 1) {
    					out(i);
    				}

    				check_outros();
    			}
    		},
    		i(local) {
    			if (current) return;

    			for (let i = 0; i < each_value.length; i += 1) {
    				transition_in(each_blocks[i]);
    			}

    			current = true;
    		},
    		o(local) {
    			each_blocks = each_blocks.filter(Boolean);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				transition_out(each_blocks[i]);
    			}

    			current = false;
    		},
    		d(detaching) {
    			destroy_each(each_blocks, detaching);
    			if (detaching) detach(each_1_anchor);
    		}
    	};
    }

    function instance$n($$self, $$props, $$invalidate) {
    	let { items = [] } = $$props;
    	let { type } = $$props;
    	let item = {};
    	const dispatch = createEventDispatcher();

    	const expandFolder = event => {
    		let li = event.target.closest("li");
    		let item = items.find(d => d.Id.toString() === li.id);

    		if (item.Content.length === 0) {
    			axios.post("/api/admin/directories/Content", { Path: item.Path }).then(({ data }) => {
    				item.Content = data.data;
    				$$invalidate(0, items);
    			});
    		} else {
    			item.Content = [];
    			$$invalidate(0, items);
    		}
    	};

    	const scanDirectory = event => {
    		let li = event.target.closest("li");
    		item = items.find(d => d.Id.toString() === li.id);
    		dispatch("scanDir", item);
    	};

    	function scanDir_handler(event) {
    		bubble.call(this, $$self, event);
    	}

    	$$self.$$set = $$props => {
    		if ('items' in $$props) $$invalidate(0, items = $$props.items);
    		if ('type' in $$props) $$invalidate(1, type = $$props.type);
    	};

    	return [items, type, expandFolder, scanDirectory, scanDir_handler];
    }

    class TreeItem extends SvelteComponent {
    	constructor(options) {
    		super();
    		init(this, options, instance$n, create_fragment$n, safe_not_equal, { items: 0, type: 1 });
    	}
    }

    /* src\Admin\Disks\DirectoryModal.svelte generated by Svelte v3.49.0 */

    function create_fragment$m(ctx) {
    	let div8;
    	let div7;
    	let div0;
    	let t1;
    	let div5;
    	let div2;
    	let div1;
    	let t3;
    	let select;
    	let option0;
    	let option1;
    	let t6;
    	let div4;
    	let div3;
    	let t8;
    	let input;
    	let t9;
    	let label2;
    	let span;
    	let span_class_value;
    	let t10;
    	let div6;
    	let button0;
    	let t12;
    	let button1;
    	let div7_transition;
    	let current;
    	let mounted;
    	let dispose;

    	return {
    		c() {
    			div8 = element("div");
    			div7 = element("div");
    			div0 = element("div");
    			div0.innerHTML = `<h3>Create</h3>`;
    			t1 = space();
    			div5 = element("div");
    			div2 = element("div");
    			div1 = element("div");
    			div1.innerHTML = `<label for="Name" class="input-group-text svelte-1xqug3q">Type</label>`;
    			t3 = space();
    			select = element("select");
    			option0 = element("option");
    			option0.textContent = "Mangas";
    			option1 = element("option");
    			option1.textContent = "Videos";
    			t6 = space();
    			div4 = element("div");
    			div3 = element("div");
    			div3.innerHTML = `<label for="is-adult" class="input-group-text svelte-1xqug3q">Is Adult</label>`;
    			t8 = space();
    			input = element("input");
    			t9 = space();
    			label2 = element("label");
    			span = element("span");
    			t10 = space();
    			div6 = element("div");
    			button0 = element("button");
    			button0.textContent = "Cancel";
    			t12 = space();
    			button1 = element("button");
    			button1.textContent = "Create";
    			attr(div0, "class", "modal-header");
    			attr(div1, "class", "input-group-prepend");
    			option0.__value = "Mangas";
    			option0.value = option0.__value;
    			option1.__value = "Videos";
    			option1.value = option1.__value;
    			attr(select, "class", "form-control");
    			attr(select, "name", "Type");
    			if (/*Type*/ ctx[1] === void 0) add_render_callback(() => /*select_change_handler*/ ctx[5].call(select));
    			attr(div2, "class", "input-group");
    			attr(div3, "class", "input-group-prepend");
    			attr(input, "id", "is-adult");
    			attr(input, "type", "checkbox");
    			attr(input, "class", "svelte-1xqug3q");
    			attr(span, "class", span_class_value = "" + (null_to_empty(`ad-icon fas fa-${/*IsAdult*/ ctx[2] ? "check" : "times"}`) + " svelte-1xqug3q"));
    			attr(label2, "id", "check-icon");
    			attr(label2, "for", "is-adult");
    			attr(label2, "class", "form-control svelte-1xqug3q");
    			attr(div4, "class", "input-group");
    			attr(div5, "class", "modal-body");
    			attr(button0, "class", "btn");
    			attr(button1, "class", "btn");
    			attr(div6, "class", "modal-footer");
    			attr(div7, "class", "modal card svelte-1xqug3q");
    			attr(div8, "class", "modal-container");
    		},
    		m(target, anchor) {
    			insert(target, div8, anchor);
    			append(div8, div7);
    			append(div7, div0);
    			append(div7, t1);
    			append(div7, div5);
    			append(div5, div2);
    			append(div2, div1);
    			append(div2, t3);
    			append(div2, select);
    			append(select, option0);
    			append(select, option1);
    			select_option(select, /*Type*/ ctx[1]);
    			append(div5, t6);
    			append(div5, div4);
    			append(div4, div3);
    			append(div4, t8);
    			append(div4, input);
    			input.checked = /*IsAdult*/ ctx[2];
    			append(div4, t9);
    			append(div4, label2);
    			append(label2, span);
    			append(div7, t10);
    			append(div7, div6);
    			append(div6, button0);
    			append(div6, t12);
    			append(div6, button1);
    			current = true;

    			if (!mounted) {
    				dispose = [
    					listen(select, "change", /*select_change_handler*/ ctx[5]),
    					listen(input, "change", /*input_change_handler*/ ctx[6]),
    					listen(button0, "click", function () {
    						if (is_function(/*hideModal*/ ctx[0])) /*hideModal*/ ctx[0].apply(this, arguments);
    					}),
    					listen(button1, "click", /*create*/ ctx[3])
    				];

    				mounted = true;
    			}
    		},
    		p(new_ctx, [dirty]) {
    			ctx = new_ctx;

    			if (dirty & /*Type*/ 2) {
    				select_option(select, /*Type*/ ctx[1]);
    			}

    			if (dirty & /*IsAdult*/ 4) {
    				input.checked = /*IsAdult*/ ctx[2];
    			}

    			if (!current || dirty & /*IsAdult*/ 4 && span_class_value !== (span_class_value = "" + (null_to_empty(`ad-icon fas fa-${/*IsAdult*/ ctx[2] ? "check" : "times"}`) + " svelte-1xqug3q"))) {
    				attr(span, "class", span_class_value);
    			}
    		},
    		i(local) {
    			if (current) return;

    			add_render_callback(() => {
    				if (!div7_transition) div7_transition = create_bidirectional_transition(div7, fade, { duration: 200 }, true);
    				div7_transition.run(1);
    			});

    			current = true;
    		},
    		o(local) {
    			if (!div7_transition) div7_transition = create_bidirectional_transition(div7, fade, { duration: 200 }, false);
    			div7_transition.run(0);
    			current = false;
    		},
    		d(detaching) {
    			if (detaching) detach(div8);
    			if (detaching && div7_transition) div7_transition.end();
    			mounted = false;
    			run_all(dispose);
    		}
    	};
    }

    function instance$m($$self, $$props, $$invalidate) {
    	let { createDirectory } = $$props;
    	let { hideModal } = $$props;
    	let Type = "Mangas";
    	let IsAdult = false;

    	const create = () => {
    		createDirectory(Type, IsAdult);
    	};

    	function select_change_handler() {
    		Type = select_value(this);
    		$$invalidate(1, Type);
    	}

    	function input_change_handler() {
    		IsAdult = this.checked;
    		$$invalidate(2, IsAdult);
    	}

    	$$self.$$set = $$props => {
    		if ('createDirectory' in $$props) $$invalidate(4, createDirectory = $$props.createDirectory);
    		if ('hideModal' in $$props) $$invalidate(0, hideModal = $$props.hideModal);
    	};

    	return [
    		hideModal,
    		Type,
    		IsAdult,
    		create,
    		createDirectory,
    		select_change_handler,
    		input_change_handler
    	];
    }

    class DirectoryModal extends SvelteComponent {
    	constructor(options) {
    		super();
    		init(this, options, instance$m, create_fragment$m, safe_not_equal, { createDirectory: 4, hideModal: 0 });
    	}
    }

    /* src\Admin\Disks\Tree.svelte generated by Svelte v3.49.0 */

    function create_if_block$b(ctx) {
    	let directorymodal;
    	let current;

    	directorymodal = new DirectoryModal({
    			props: {
    				createDirectory: /*createDirectory*/ ctx[3],
    				hideModal: /*hideModal*/ ctx[4]
    			}
    		});

    	return {
    		c() {
    			create_component(directorymodal.$$.fragment);
    		},
    		m(target, anchor) {
    			mount_component(directorymodal, target, anchor);
    			current = true;
    		},
    		p: noop,
    		i(local) {
    			if (current) return;
    			transition_in(directorymodal.$$.fragment, local);
    			current = true;
    		},
    		o(local) {
    			transition_out(directorymodal.$$.fragment, local);
    			current = false;
    		},
    		d(detaching) {
    			destroy_component(directorymodal, detaching);
    		}
    	};
    }

    function create_fragment$l(ctx) {
    	let t0;
    	let div;
    	let t3;
    	let ul;
    	let treeitem;
    	let current;
    	let if_block = /*showModal*/ ctx[1] && create_if_block$b(ctx);

    	treeitem = new TreeItem({
    			props: { type: "hdd", items: /*content*/ ctx[0] }
    		});

    	treeitem.$on("scanDir", /*scanDir*/ ctx[2]);

    	return {
    		c() {
    			if (if_block) if_block.c();
    			t0 = space();
    			div = element("div");

    			div.innerHTML = `<i class="fas fa-server"></i> 
  <span class="tree-name">Server</span>`;

    			t3 = space();
    			ul = element("ul");
    			create_component(treeitem.$$.fragment);
    			attr(div, "class", "tree-title");
    			attr(ul, "class", "tree-view svelte-1kc7hqf");
    		},
    		m(target, anchor) {
    			if (if_block) if_block.m(target, anchor);
    			insert(target, t0, anchor);
    			insert(target, div, anchor);
    			insert(target, t3, anchor);
    			insert(target, ul, anchor);
    			mount_component(treeitem, ul, null);
    			current = true;
    		},
    		p(ctx, [dirty]) {
    			if (/*showModal*/ ctx[1]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);

    					if (dirty & /*showModal*/ 2) {
    						transition_in(if_block, 1);
    					}
    				} else {
    					if_block = create_if_block$b(ctx);
    					if_block.c();
    					transition_in(if_block, 1);
    					if_block.m(t0.parentNode, t0);
    				}
    			} else if (if_block) {
    				group_outros();

    				transition_out(if_block, 1, 1, () => {
    					if_block = null;
    				});

    				check_outros();
    			}

    			const treeitem_changes = {};
    			if (dirty & /*content*/ 1) treeitem_changes.items = /*content*/ ctx[0];
    			treeitem.$set(treeitem_changes);
    		},
    		i(local) {
    			if (current) return;
    			transition_in(if_block);
    			transition_in(treeitem.$$.fragment, local);
    			current = true;
    		},
    		o(local) {
    			transition_out(if_block);
    			transition_out(treeitem.$$.fragment, local);
    			current = false;
    		},
    		d(detaching) {
    			if (if_block) if_block.d(detaching);
    			if (detaching) detach(t0);
    			if (detaching) detach(div);
    			if (detaching) detach(t3);
    			if (detaching) detach(ul);
    			destroy_component(treeitem);
    		}
    	};
    }

    function instance$l($$self, $$props, $$invalidate) {
    	const socket = getContext("socket");
    	let content = [];
    	let showModal = false;
    	let item = {};

    	const scanDir = ({ detail }) => {
    		item = detail;
    		$$invalidate(1, showModal = true);
    	};

    	const createDirectory = (Type, IsAdult) => {
    		socket.emit("scan-dir", { Path: item.Path, Type, IsAdult });
    		hideModal();
    	};

    	const hideModal = () => {
    		$$invalidate(1, showModal = false);
    		item = {};
    	};

    	onMount(() => {
    		socket.on("disk-loaded", data => {
    			$$invalidate(0, content = data);
    		});

    		socket.emit("load-disks");
    	});

    	onDestroy(() => {
    		delete socket._callbacks["$disk-loaded"];
    	});

    	return [content, showModal, scanDir, createDirectory, hideModal];
    }

    class Tree extends SvelteComponent {
    	constructor(options) {
    		super();
    		init(this, options, instance$l, create_fragment$l, safe_not_equal, {});
    	}
    }

    /* src\Admin\Disks\Directories.svelte generated by Svelte v3.49.0 */

    function get_each_context$7(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[5] = list[i].Id;
    	child_ctx[6] = list[i].Name;
    	child_ctx[7] = list[i].IsLoading;
    	child_ctx[8] = list[i].FullPath;
    	child_ctx[9] = list[i].Type;
    	return child_ctx;
    }

    // (71:4) {:else}
    function create_else_block$6(ctx) {
    	let each_1_anchor;
    	let each_value = /*dirs*/ ctx[0];
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$7(get_each_context$7(ctx, each_value, i));
    	}

    	return {
    		c() {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			each_1_anchor = empty$1();
    		},
    		m(target, anchor) {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(target, anchor);
    			}

    			insert(target, each_1_anchor, anchor);
    		},
    		p(ctx, dirty) {
    			if (dirty & /*dirs, removeDir, rescan*/ 13) {
    				each_value = /*dirs*/ ctx[0];
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$7(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block$7(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(each_1_anchor.parentNode, each_1_anchor);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}
    		},
    		d(detaching) {
    			destroy_each(each_blocks, detaching);
    			if (detaching) detach(each_1_anchor);
    		}
    	};
    }

    // (67:4) {#if dirs.length < 0}
    function create_if_block$a(ctx) {
    	let tr;

    	return {
    		c() {
    			tr = element("tr");
    			tr.innerHTML = `<td colspan="4">Not Directory Added</td>`;
    			attr(tr, "class", "text-center");
    		},
    		m(target, anchor) {
    			insert(target, tr, anchor);
    		},
    		p: noop,
    		d(detaching) {
    			if (detaching) detach(tr);
    		}
    	};
    }

    // (72:6) {#each dirs as { Id, Name, IsLoading, FullPath, Type }}
    function create_each_block$7(ctx) {
    	let tr;
    	let td0;
    	let span0;
    	let i0;
    	let i0_class_value;
    	let t0;
    	let span1;
    	let t1;
    	let td1;
    	let t2_value = /*Name*/ ctx[6] + "";
    	let t2;
    	let t3;
    	let td2;
    	let t4_value = /*Type*/ ctx[9] + "";
    	let t4;
    	let t5;
    	let td3;
    	let t6_value = /*FullPath*/ ctx[8] + "";
    	let t6;
    	let t7;
    	let tr_id_value;
    	let tr_key_value;
    	let mounted;
    	let dispose;

    	return {
    		c() {
    			tr = element("tr");
    			td0 = element("td");
    			span0 = element("span");
    			i0 = element("i");
    			t0 = space();
    			span1 = element("span");
    			span1.innerHTML = `<i class="fas fa-trash-alt"></i>`;
    			t1 = space();
    			td1 = element("td");
    			t2 = text(t2_value);
    			t3 = space();
    			td2 = element("td");
    			t4 = text(t4_value);
    			t5 = space();
    			td3 = element("td");
    			t6 = text(t6_value);
    			t7 = space();
    			attr(i0, "class", i0_class_value = "" + (null_to_empty("fas fa-sync" + (/*IsLoading*/ ctx[7] ? " fa-spin" : "")) + " svelte-te2s82"));
    			attr(span0, "class", "dir-sync");
    			attr(span1, "class", "dir-remove ml-2");
    			attr(tr, "id", tr_id_value = /*Id*/ ctx[5]);
    			attr(tr, "key", tr_key_value = /*Id*/ ctx[5]);
    		},
    		m(target, anchor) {
    			insert(target, tr, anchor);
    			append(tr, td0);
    			append(td0, span0);
    			append(span0, i0);
    			append(td0, t0);
    			append(td0, span1);
    			append(tr, t1);
    			append(tr, td1);
    			append(td1, t2);
    			append(tr, t3);
    			append(tr, td2);
    			append(td2, t4);
    			append(tr, t5);
    			append(tr, td3);
    			append(td3, t6);
    			append(tr, t7);

    			if (!mounted) {
    				dispose = [
    					listen(span0, "click", /*rescan*/ ctx[3]),
    					listen(span1, "click", /*removeDir*/ ctx[2])
    				];

    				mounted = true;
    			}
    		},
    		p(ctx, dirty) {
    			if (dirty & /*dirs*/ 1 && i0_class_value !== (i0_class_value = "" + (null_to_empty("fas fa-sync" + (/*IsLoading*/ ctx[7] ? " fa-spin" : "")) + " svelte-te2s82"))) {
    				attr(i0, "class", i0_class_value);
    			}

    			if (dirty & /*dirs*/ 1 && t2_value !== (t2_value = /*Name*/ ctx[6] + "")) set_data(t2, t2_value);
    			if (dirty & /*dirs*/ 1 && t4_value !== (t4_value = /*Type*/ ctx[9] + "")) set_data(t4, t4_value);
    			if (dirty & /*dirs*/ 1 && t6_value !== (t6_value = /*FullPath*/ ctx[8] + "")) set_data(t6, t6_value);

    			if (dirty & /*dirs*/ 1 && tr_id_value !== (tr_id_value = /*Id*/ ctx[5])) {
    				attr(tr, "id", tr_id_value);
    			}

    			if (dirty & /*dirs*/ 1 && tr_key_value !== (tr_key_value = /*Id*/ ctx[5])) {
    				attr(tr, "key", tr_key_value);
    			}
    		},
    		d(detaching) {
    			if (detaching) detach(tr);
    			mounted = false;
    			run_all(dispose);
    		}
    	};
    }

    function create_fragment$k(ctx) {
    	let div;
    	let t0;
    	let t1;
    	let table;
    	let thead;
    	let t9;
    	let tbody;

    	function select_block_type(ctx, dirty) {
    		if (/*dirs*/ ctx[0].length < 0) return create_if_block$a;
    		return create_else_block$6;
    	}

    	let current_block_type = select_block_type(ctx);
    	let if_block = current_block_type(ctx);

    	return {
    		c() {
    			div = element("div");
    			t0 = text(/*msg*/ ctx[1]);
    			t1 = space();
    			table = element("table");
    			thead = element("thead");

    			thead.innerHTML = `<tr><th>Actions</th> 
      <th>Name</th> 
      <th>Type</th> 
      <th>Full Path</th></tr>`;

    			t9 = space();
    			tbody = element("tbody");
    			if_block.c();
    			attr(div, "class", "message svelte-te2s82");
    			attr(table, "id", "dir-list");
    			attr(table, "class", "table table-dark table-hover table-bordered");
    		},
    		m(target, anchor) {
    			insert(target, div, anchor);
    			append(div, t0);
    			insert(target, t1, anchor);
    			insert(target, table, anchor);
    			append(table, thead);
    			append(table, t9);
    			append(table, tbody);
    			if_block.m(tbody, null);
    		},
    		p(ctx, [dirty]) {
    			if (dirty & /*msg*/ 2) set_data(t0, /*msg*/ ctx[1]);

    			if (current_block_type === (current_block_type = select_block_type(ctx)) && if_block) {
    				if_block.p(ctx, dirty);
    			} else {
    				if_block.d(1);
    				if_block = current_block_type(ctx);

    				if (if_block) {
    					if_block.c();
    					if_block.m(tbody, null);
    				}
    			}
    		},
    		i: noop,
    		o: noop,
    		d(detaching) {
    			if (detaching) detach(div);
    			if (detaching) detach(t1);
    			if (detaching) detach(table);
    			if_block.d();
    		}
    	};
    }

    function instance$k($$self, $$props, $$invalidate) {
    	const socket = getContext("socket");
    	let dirs = [];
    	let msg = "";

    	onMount(async () => {
    		let resp = await axios.get("/api/admin/directories");
    		$$invalidate(0, dirs = resp.data);

    		socket.on("scan-finish", ({ id }) => {
    			if (id) {
    				let dir = dirs.find(d => d.Id === id);
    				dir.IsLoading = false;
    				$$invalidate(0, dirs);
    			}
    		});

    		socket.on("scan-info", info => {
    			console.log(info);
    		});
    	});

    	onDestroy(() => {
    		delete socket._callbacks["$scan-finish"];
    		delete socket._callbacks["$scan-info"];
    	});

    	const removeDir = e => {
    		let tr = e.target.closest("tr");

    		if (tr) {
    			axios.delete("/api/admin/directories/remove", { data: { Id: tr.id } }).then(({ data }) => {
    				if (data.removed) {
    					$$invalidate(0, dirs = dirs.filter(d => d.Id !== tr.id));
    					$$invalidate(0, dirs);
    				} else {
    					$$invalidate(1, msg = data.msg);
    				}
    			});
    		}
    	};

    	const rescan = e => {
    		let tr = e.target.closest("tr");
    		let dir = dirs.find(d => d.Id === tr.id);
    		socket.emit("scan-dir", { Id: dir.Id });
    		dir.IsLoading = true;
    		$$invalidate(0, dirs);
    	};

    	return [dirs, msg, removeDir, rescan];
    }

    class Directories extends SvelteComponent {
    	constructor(options) {
    		super();
    		init(this, options, instance$k, create_fragment$k, safe_not_equal, {});
    	}
    }

    /* src\Admin\Disks\DiskManager.svelte generated by Svelte v3.49.0 */

    function create_else_block$5(ctx) {
    	let div;
    	let tree;
    	let div_intro;
    	let div_outro;
    	let current;
    	tree = new Tree({});

    	return {
    		c() {
    			div = element("div");
    			create_component(tree.$$.fragment);
    			attr(div, "id", "tabs-content");
    			attr(div, "class", "svelte-1crvm1x");
    		},
    		m(target, anchor) {
    			insert(target, div, anchor);
    			mount_component(tree, div, null);
    			current = true;
    		},
    		i(local) {
    			if (current) return;
    			transition_in(tree.$$.fragment, local);

    			add_render_callback(() => {
    				if (div_outro) div_outro.end(1);
    				div_intro = create_in_transition(div, fly, { y: 200, duration: 200 });
    				div_intro.start();
    			});

    			current = true;
    		},
    		o(local) {
    			transition_out(tree.$$.fragment, local);
    			if (div_intro) div_intro.invalidate();
    			div_outro = create_out_transition(div, fly, { y: 200, duration: 200 });
    			current = false;
    		},
    		d(detaching) {
    			if (detaching) detach(div);
    			destroy_component(tree);
    			if (detaching && div_outro) div_outro.end();
    		}
    	};
    }

    // (96:2) {#if tab.includes('tab-1')}
    function create_if_block$9(ctx) {
    	let div;
    	let directories;
    	let div_intro;
    	let div_outro;
    	let current;
    	directories = new Directories({});

    	return {
    		c() {
    			div = element("div");
    			create_component(directories.$$.fragment);
    			attr(div, "id", "tabs-content");
    			attr(div, "class", "svelte-1crvm1x");
    		},
    		m(target, anchor) {
    			insert(target, div, anchor);
    			mount_component(directories, div, null);
    			current = true;
    		},
    		i(local) {
    			if (current) return;
    			transition_in(directories.$$.fragment, local);

    			add_render_callback(() => {
    				if (div_outro) div_outro.end(1);
    				div_intro = create_in_transition(div, fly, { y: 200, duration: 200 });
    				div_intro.start();
    			});

    			current = true;
    		},
    		o(local) {
    			transition_out(directories.$$.fragment, local);
    			if (div_intro) div_intro.invalidate();
    			div_outro = create_out_transition(div, fly, { y: 200, duration: 200 });
    			current = false;
    		},
    		d(detaching) {
    			if (detaching) detach(div);
    			destroy_component(directories);
    			if (detaching && div_outro) div_outro.end();
    		}
    	};
    }

    function create_fragment$j(ctx) {
    	let div4;
    	let div3;
    	let div0;
    	let input0;
    	let t0;
    	let label0;
    	let t3;
    	let div2;
    	let input1;
    	let t4;
    	let label1;
    	let t7;
    	let show_if;
    	let current_block_type_index;
    	let if_block;
    	let current;
    	let mounted;
    	let dispose;
    	const if_block_creators = [create_if_block$9, create_else_block$5];
    	const if_blocks = [];

    	function select_block_type(ctx, dirty) {
    		if (dirty & /*tab*/ 1) show_if = null;
    		if (show_if == null) show_if = !!/*tab*/ ctx[0].includes('tab-1');
    		if (show_if) return 0;
    		return 1;
    	}

    	current_block_type_index = select_block_type(ctx, -1);
    	if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);

    	return {
    		c() {
    			div4 = element("div");
    			div3 = element("div");
    			div0 = element("div");
    			input0 = element("input");
    			t0 = space();
    			label0 = element("label");

    			label0.innerHTML = `<i class="fas fa-folder svelte-1crvm1x"></i> 
        <span id="dirs" class="svelte-1crvm1x">Directories</span>`;

    			t3 = space();
    			div2 = element("div");
    			input1 = element("input");
    			t4 = space();
    			label1 = element("label");

    			label1.innerHTML = `<div class="fas fa-hdd svelte-1crvm1x"></div> 
        <span id="disks" class="svelte-1crvm1x">Server</span>`;

    			t7 = space();
    			if_block.c();
    			attr(input0, "type", "radio");
    			input0.__value = "tab-1";
    			input0.value = input0.__value;
    			attr(input0, "id", "tab1");
    			attr(input0, "class", "svelte-1crvm1x");
    			/*$$binding_groups*/ ctx[2][0].push(input0);
    			attr(label0, "class", "nav-link svelte-1crvm1x");
    			attr(label0, "for", "tab1");
    			attr(div0, "class", "nav-item");
    			attr(input1, "type", "radio");
    			input1.__value = "tab-2";
    			input1.value = input1.__value;
    			attr(input1, "id", "tab2");
    			attr(input1, "class", "svelte-1crvm1x");
    			/*$$binding_groups*/ ctx[2][0].push(input1);
    			attr(label1, "class", "nav-link svelte-1crvm1x");
    			attr(label1, "for", "tab2");
    			attr(div2, "class", "nav-item");
    			attr(div3, "class", "nav nav-tabs controls svelte-1crvm1x");
    			attr(div4, "class", "card bg-dark text-light admin-manager svelte-1crvm1x");
    		},
    		m(target, anchor) {
    			insert(target, div4, anchor);
    			append(div4, div3);
    			append(div3, div0);
    			append(div0, input0);
    			input0.checked = input0.__value === /*tab*/ ctx[0];
    			append(div0, t0);
    			append(div0, label0);
    			append(div3, t3);
    			append(div3, div2);
    			append(div2, input1);
    			input1.checked = input1.__value === /*tab*/ ctx[0];
    			append(div2, t4);
    			append(div2, label1);
    			append(div4, t7);
    			if_blocks[current_block_type_index].m(div4, null);
    			current = true;

    			if (!mounted) {
    				dispose = [
    					listen(input0, "change", /*input0_change_handler*/ ctx[1]),
    					listen(input1, "change", /*input1_change_handler*/ ctx[3])
    				];

    				mounted = true;
    			}
    		},
    		p(ctx, [dirty]) {
    			if (dirty & /*tab*/ 1) {
    				input0.checked = input0.__value === /*tab*/ ctx[0];
    			}

    			if (dirty & /*tab*/ 1) {
    				input1.checked = input1.__value === /*tab*/ ctx[0];
    			}

    			let previous_block_index = current_block_type_index;
    			current_block_type_index = select_block_type(ctx, dirty);

    			if (current_block_type_index !== previous_block_index) {
    				group_outros();

    				transition_out(if_blocks[previous_block_index], 1, 1, () => {
    					if_blocks[previous_block_index] = null;
    				});

    				check_outros();
    				if_block = if_blocks[current_block_type_index];

    				if (!if_block) {
    					if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    					if_block.c();
    				}

    				transition_in(if_block, 1);
    				if_block.m(div4, null);
    			}
    		},
    		i(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d(detaching) {
    			if (detaching) detach(div4);
    			/*$$binding_groups*/ ctx[2][0].splice(/*$$binding_groups*/ ctx[2][0].indexOf(input0), 1);
    			/*$$binding_groups*/ ctx[2][0].splice(/*$$binding_groups*/ ctx[2][0].indexOf(input1), 1);
    			if_blocks[current_block_type_index].d();
    			mounted = false;
    			run_all(dispose);
    		}
    	};
    }

    function instance$j($$self, $$props, $$invalidate) {
    	let { tab = "tab-1" } = $$props;
    	const $$binding_groups = [[]];

    	function input0_change_handler() {
    		tab = this.__value;
    		$$invalidate(0, tab);
    	}

    	function input1_change_handler() {
    		tab = this.__value;
    		$$invalidate(0, tab);
    	}

    	$$self.$$set = $$props => {
    		if ('tab' in $$props) $$invalidate(0, tab = $$props.tab);
    	};

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*tab*/ 1) {
    			{
    				navigate(`/content-manager/${tab || "tab-1"}`, { replace: true });
    			}
    		}
    	};

    	return [tab, input0_change_handler, $$binding_groups, input1_change_handler];
    }

    class DiskManager extends SvelteComponent {
    	constructor(options) {
    		super();
    		init(this, options, instance$j, create_fragment$j, safe_not_equal, { tab: 0 });
    	}
    }

    /* src\Admin\FilesManager\Files.svelte generated by Svelte v3.49.0 */

    function get_each_context$6(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[16] = list[i].Id;
    	child_ctx[17] = list[i].Name;
    	child_ctx[18] = list[i].Type;
    	child_ctx[19] = list[i].Folder;
    	return child_ctx;
    }

    // (145:0) {#if showModal}
    function create_if_block_1$4(ctx) {
    	let modal;
    	let current;

    	modal = new Modal({
    			props: {
    				file: /*file*/ ctx[4],
    				modalType: /*modalType*/ ctx[6]
    			}
    		});

    	modal.$on("submit", /*handleSubmit*/ ctx[10]);
    	modal.$on("click", /*hideModal*/ ctx[11]);

    	return {
    		c() {
    			create_component(modal.$$.fragment);
    		},
    		m(target, anchor) {
    			mount_component(modal, target, anchor);
    			current = true;
    		},
    		p(ctx, dirty) {
    			const modal_changes = {};
    			if (dirty & /*file*/ 16) modal_changes.file = /*file*/ ctx[4];
    			if (dirty & /*modalType*/ 64) modal_changes.modalType = /*modalType*/ ctx[6];
    			modal.$set(modal_changes);
    		},
    		i(local) {
    			if (current) return;
    			transition_in(modal.$$.fragment, local);
    			current = true;
    		},
    		o(local) {
    			transition_out(modal.$$.fragment, local);
    			current = false;
    		},
    		d(detaching) {
    			destroy_component(modal, detaching);
    		}
    	};
    }

    // (168:8) {:else}
    function create_else_block$4(ctx) {
    	let each_1_anchor;
    	let each_value = /*items*/ ctx[3];
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$6(get_each_context$6(ctx, each_value, i));
    	}

    	return {
    		c() {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			each_1_anchor = empty$1();
    		},
    		m(target, anchor) {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(target, anchor);
    			}

    			insert(target, each_1_anchor, anchor);
    		},
    		p(ctx, dirty) {
    			if (dirty & /*items, itemClick*/ 520) {
    				each_value = /*items*/ ctx[3];
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$6(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block$6(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(each_1_anchor.parentNode, each_1_anchor);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}
    		},
    		d(detaching) {
    			destroy_each(each_blocks, detaching);
    			if (detaching) detach(each_1_anchor);
    		}
    	};
    }

    // (164:8) {#if items.length < 1}
    function create_if_block$8(ctx) {
    	let tr;

    	return {
    		c() {
    			tr = element("tr");
    			tr.innerHTML = `<td colspan="3">No Files Found</td>`;
    		},
    		m(target, anchor) {
    			insert(target, tr, anchor);
    		},
    		p: noop,
    		d(detaching) {
    			if (detaching) detach(tr);
    		}
    	};
    }

    // (169:10) {#each items as { Id, Name, Type, Folder }}
    function create_each_block$6(ctx) {
    	let tr;
    	let td0;
    	let t1;
    	let td1;
    	let t2_value = /*Name*/ ctx[17] + "";
    	let t2;
    	let t3;
    	let td2;
    	let t4_value = /*Folder*/ ctx[19].Path + "";
    	let t4;
    	let t5;
    	let tr_id_value;
    	let mounted;
    	let dispose;

    	return {
    		c() {
    			tr = element("tr");
    			td0 = element("td");

    			td0.innerHTML = `<i class="fas fa-edit svelte-2ttdvu"></i> 
                <i class="fas fa-trash-alt svelte-2ttdvu"></i>`;

    			t1 = space();
    			td1 = element("td");
    			t2 = text(t2_value);
    			t3 = space();
    			td2 = element("td");
    			t4 = text(t4_value);
    			t5 = space();
    			attr(tr, "id", tr_id_value = /*Id*/ ctx[16]);
    		},
    		m(target, anchor) {
    			insert(target, tr, anchor);
    			append(tr, td0);
    			append(tr, t1);
    			append(tr, td1);
    			append(td1, t2);
    			append(tr, t3);
    			append(tr, td2);
    			append(td2, t4);
    			append(tr, t5);

    			if (!mounted) {
    				dispose = listen(tr, "click", /*itemClick*/ ctx[9]);
    				mounted = true;
    			}
    		},
    		p(ctx, dirty) {
    			if (dirty & /*items*/ 8 && t2_value !== (t2_value = /*Name*/ ctx[17] + "")) set_data(t2, t2_value);
    			if (dirty & /*items*/ 8 && t4_value !== (t4_value = /*Folder*/ ctx[19].Path + "")) set_data(t4, t4_value);

    			if (dirty & /*items*/ 8 && tr_id_value !== (tr_id_value = /*Id*/ ctx[16])) {
    				attr(tr, "id", tr_id_value);
    			}
    		},
    		d(detaching) {
    			if (detaching) detach(tr);
    			mounted = false;
    			dispose();
    		}
    	};
    }

    function create_fragment$i(ctx) {
    	let t0;
    	let div3;
    	let div0;
    	let filter_1;
    	let t1;
    	let h4;
    	let t2_value = `${/*totalItems*/ ctx[2]} - Files` + "";
    	let t2;
    	let t3;
    	let div1;
    	let table;
    	let thead;
    	let t9;
    	let tbody;
    	let t10;
    	let div2;
    	let pagination;
    	let current;
    	let if_block0 = /*showModal*/ ctx[5] && create_if_block_1$4(ctx);
    	filter_1 = new Filter({});
    	filter_1.$on("filter", /*onFilter*/ ctx[7]);

    	function select_block_type(ctx, dirty) {
    		if (/*items*/ ctx[3].length < 1) return create_if_block$8;
    		return create_else_block$4;
    	}

    	let current_block_type = select_block_type(ctx);
    	let if_block1 = current_block_type(ctx);

    	pagination = new Pagination({
    			props: {
    				page: /*page*/ ctx[0],
    				totalPages: /*totalPages*/ ctx[1]
    			}
    		});

    	pagination.$on("gotopage", /*goToPage*/ ctx[8]);

    	return {
    		c() {
    			if (if_block0) if_block0.c();
    			t0 = space();
    			div3 = element("div");
    			div0 = element("div");
    			create_component(filter_1.$$.fragment);
    			t1 = space();
    			h4 = element("h4");
    			t2 = text(t2_value);
    			t3 = space();
    			div1 = element("div");
    			table = element("table");
    			thead = element("thead");

    			thead.innerHTML = `<tr><td>Actions</td> 
          <td>Name</td> 
          <td>Path</td></tr>`;

    			t9 = space();
    			tbody = element("tbody");
    			if_block1.c();
    			t10 = space();
    			div2 = element("div");
    			create_component(pagination.$$.fragment);
    			attr(h4, "class", "text-center svelte-2ttdvu");
    			attr(div0, "class", "controls svelte-2ttdvu");
    			attr(table, "class", "table table-bordered table-dark");
    			attr(div1, "class", "list-container svelte-2ttdvu");
    			attr(div2, "class", "list-controls svelte-2ttdvu");
    			attr(div3, "class", "file-list col-6 svelte-2ttdvu");
    		},
    		m(target, anchor) {
    			if (if_block0) if_block0.m(target, anchor);
    			insert(target, t0, anchor);
    			insert(target, div3, anchor);
    			append(div3, div0);
    			mount_component(filter_1, div0, null);
    			append(div0, t1);
    			append(div0, h4);
    			append(h4, t2);
    			append(div3, t3);
    			append(div3, div1);
    			append(div1, table);
    			append(table, thead);
    			append(table, t9);
    			append(table, tbody);
    			if_block1.m(tbody, null);
    			append(div3, t10);
    			append(div3, div2);
    			mount_component(pagination, div2, null);
    			current = true;
    		},
    		p(ctx, [dirty]) {
    			if (/*showModal*/ ctx[5]) {
    				if (if_block0) {
    					if_block0.p(ctx, dirty);

    					if (dirty & /*showModal*/ 32) {
    						transition_in(if_block0, 1);
    					}
    				} else {
    					if_block0 = create_if_block_1$4(ctx);
    					if_block0.c();
    					transition_in(if_block0, 1);
    					if_block0.m(t0.parentNode, t0);
    				}
    			} else if (if_block0) {
    				group_outros();

    				transition_out(if_block0, 1, 1, () => {
    					if_block0 = null;
    				});

    				check_outros();
    			}

    			if ((!current || dirty & /*totalItems*/ 4) && t2_value !== (t2_value = `${/*totalItems*/ ctx[2]} - Files` + "")) set_data(t2, t2_value);

    			if (current_block_type === (current_block_type = select_block_type(ctx)) && if_block1) {
    				if_block1.p(ctx, dirty);
    			} else {
    				if_block1.d(1);
    				if_block1 = current_block_type(ctx);

    				if (if_block1) {
    					if_block1.c();
    					if_block1.m(tbody, null);
    				}
    			}

    			const pagination_changes = {};
    			if (dirty & /*page*/ 1) pagination_changes.page = /*page*/ ctx[0];
    			if (dirty & /*totalPages*/ 2) pagination_changes.totalPages = /*totalPages*/ ctx[1];
    			pagination.$set(pagination_changes);
    		},
    		i(local) {
    			if (current) return;
    			transition_in(if_block0);
    			transition_in(filter_1.$$.fragment, local);
    			transition_in(pagination.$$.fragment, local);
    			current = true;
    		},
    		o(local) {
    			transition_out(if_block0);
    			transition_out(filter_1.$$.fragment, local);
    			transition_out(pagination.$$.fragment, local);
    			current = false;
    		},
    		d(detaching) {
    			if (if_block0) if_block0.d(detaching);
    			if (detaching) detach(t0);
    			if (detaching) detach(div3);
    			destroy_component(filter_1);
    			if_block1.d();
    			destroy_component(pagination);
    		}
    	};
    }

    function instance$i($$self, $$props, $$invalidate) {
    	const socket = getContext("socket");
    	let { page = 1 } = $$props;
    	let { filter = "" } = $$props;
    	let totalPages = 0;
    	let totalItems = 0;
    	let items = [];
    	let file = {};
    	let showModal = false;
    	let modalType = {};

    	const calRows = () => {
    		let container = document.querySelector(".list-container") || {};
    		return parseInt(container.offsetHeight / 45) - 1;
    	};

    	const loadFiles = async pg => {
    		let { data } = await axios.get(`/api/admin/files/${pg}/${calRows()}/${filter || ""}`);

    		if (data.files) {
    			$$invalidate(3, items = data.files);
    			$$invalidate(1, totalPages = data.totalPages || 0);
    			$$invalidate(2, totalItems = data.totalItems || 0);
    			$$invalidate(0, page = pg);
    		}
    	};

    	onMount(async () => {
    		loadFiles(1);

    		socket.on("file-renamed", data => {
    			if (data.success) {
    				$$invalidate(4, file.Name = data.Name, file);
    				$$invalidate(3, items);
    				hideModal();
    			}
    		});

    		socket.on("file-removed", data => {
    			if (data.success) {
    				if (page === totalPages && items.length > 1) {
    					$$invalidate(3, items = items.filter(f => f.Id !== file.Id));
    				} else {
    					$$invalidate(0, page = page > 1 ? page - 1 : page);
    					loadFiles(page);
    				}

    				hideModal();
    			}
    		});
    	});

    	onDestroy(() => {
    		delete socket._callbacks["$file-renamed"];
    		delete socket._callbacks["$file-removed"];
    	});

    	const onFilter = event => {
    		$$invalidate(12, filter = event.detail);
    		loadFiles(1);
    	};

    	const goToPage = pg => {
    		pg = parseInt(pg.detail);
    		if (pg < 1 || pg > totalPages) return;
    		$$invalidate(0, page = pg < 1 ? 1 : pg > totalPages ? totalPages : pg);
    		loadFiles(page);
    	};

    	const itemClick = event => {
    		let el = event.target;

    		if (el.tagName === "I") {
    			$$invalidate(4, file = items.find(f => f.Id === el.closest("tr").id));
    			let cList = el.classList.toString();

    			if ((/fa-edit/gi).test(cList)) {
    				$$invalidate(6, modalType = {
    					title: "Edit File",
    					Del: false,
    					isFile: true
    				});
    			} else {
    				$$invalidate(6, modalType = {
    					title: "Remove File",
    					Del: true,
    					isFile: true
    				});
    			}

    			$$invalidate(5, showModal = true);
    		}
    	};

    	const handleSubmit = event => {
    		if (modalType.Del) {
    			let Del = event.target.querySelector("input").checked;
    			socket.emit("remove-file", { Id: file.Id, Del });
    		} else {
    			let Name = event.target.querySelector("input").value;

    			if (!Name) {
    				$$invalidate(6, modalType.error = "Name Can't be empty", modalType);
    			} else {
    				socket.emit("rename-file", { Id: file.Id, Name });
    			}
    		}
    	};

    	const hideModal = () => {
    		$$invalidate(5, showModal = false);
    		$$invalidate(4, file = {});
    	};

    	$$self.$$set = $$props => {
    		if ('page' in $$props) $$invalidate(0, page = $$props.page);
    		if ('filter' in $$props) $$invalidate(12, filter = $$props.filter);
    	};

    	return [
    		page,
    		totalPages,
    		totalItems,
    		items,
    		file,
    		showModal,
    		modalType,
    		onFilter,
    		goToPage,
    		itemClick,
    		handleSubmit,
    		hideModal,
    		filter
    	];
    }

    class Files extends SvelteComponent {
    	constructor(options) {
    		super();
    		init(this, options, instance$i, create_fragment$i, safe_not_equal, { page: 0, filter: 12 });
    	}
    }

    /* src\Admin\AdminRoutes.svelte generated by Svelte v3.49.0 */

    function create_default_slot$4(ctx) {
    	let navbar;
    	let t0;
    	let div;
    	let route0;
    	let t1;
    	let route1;
    	let t2;
    	let route2;
    	let t3;
    	let route3;
    	let current;
    	navbar = new Navbar({ props: { navItems: /*navItems*/ ctx[0] } });
    	navbar.$on("click", /*click_handler*/ ctx[1]);

    	route0 = new Route({
    			props: {
    				path: "/folders/:page/:filter",
    				component: Folders
    			}
    		});

    	route1 = new Route({
    			props: {
    				path: "/content-manager/:tab",
    				component: DiskManager
    			}
    		});

    	route2 = new Route({
    			props: {
    				path: "/files/:page/:filter",
    				component: Files
    			}
    		});

    	route3 = new Route({ props: { path: "/", component: User } });

    	return {
    		c() {
    			create_component(navbar.$$.fragment);
    			t0 = space();
    			div = element("div");
    			create_component(route0.$$.fragment);
    			t1 = space();
    			create_component(route1.$$.fragment);
    			t2 = space();
    			create_component(route2.$$.fragment);
    			t3 = space();
    			create_component(route3.$$.fragment);
    			attr(div, "class", "content svelte-913v8z");
    		},
    		m(target, anchor) {
    			mount_component(navbar, target, anchor);
    			insert(target, t0, anchor);
    			insert(target, div, anchor);
    			mount_component(route0, div, null);
    			append(div, t1);
    			mount_component(route1, div, null);
    			append(div, t2);
    			mount_component(route2, div, null);
    			append(div, t3);
    			mount_component(route3, div, null);
    			current = true;
    		},
    		p: noop,
    		i(local) {
    			if (current) return;
    			transition_in(navbar.$$.fragment, local);
    			transition_in(route0.$$.fragment, local);
    			transition_in(route1.$$.fragment, local);
    			transition_in(route2.$$.fragment, local);
    			transition_in(route3.$$.fragment, local);
    			current = true;
    		},
    		o(local) {
    			transition_out(navbar.$$.fragment, local);
    			transition_out(route0.$$.fragment, local);
    			transition_out(route1.$$.fragment, local);
    			transition_out(route2.$$.fragment, local);
    			transition_out(route3.$$.fragment, local);
    			current = false;
    		},
    		d(detaching) {
    			destroy_component(navbar, detaching);
    			if (detaching) detach(t0);
    			if (detaching) detach(div);
    			destroy_component(route0);
    			destroy_component(route1);
    			destroy_component(route2);
    			destroy_component(route3);
    		}
    	};
    }

    function create_fragment$h(ctx) {
    	let router;
    	let current;

    	router = new Router({
    			props: {
    				$$slots: { default: [create_default_slot$4] },
    				$$scope: { ctx }
    			}
    		});

    	return {
    		c() {
    			create_component(router.$$.fragment);
    		},
    		m(target, anchor) {
    			mount_component(router, target, anchor);
    			current = true;
    		},
    		p(ctx, [dirty]) {
    			const router_changes = {};

    			if (dirty & /*$$scope*/ 4) {
    				router_changes.$$scope = { dirty, ctx };
    			}

    			router.$set(router_changes);
    		},
    		i(local) {
    			if (current) return;
    			transition_in(router.$$.fragment, local);
    			current = true;
    		},
    		o(local) {
    			transition_out(router.$$.fragment, local);
    			current = false;
    		},
    		d(detaching) {
    			destroy_component(router, detaching);
    		}
    	};
    }

    function instance$h($$self) {
    	const navItems = [
    		{
    			title: "Users",
    			path: "/",
    			class: "users"
    		},
    		{
    			title: "Files",
    			path: "/files",
    			class: "file"
    		},
    		{
    			title: "Folders",
    			path: "/folders",
    			class: "folder"
    		},
    		{
    			title: "Content Manager",
    			path: "/content-manager/tab-1",
    			class: "sitemap"
    		}
    	];

    	function click_handler(event) {
    		bubble.call(this, $$self, event);
    	}

    	return [navItems, click_handler];
    }

    class AdminRoutes extends SvelteComponent {
    	constructor(options) {
    		super();
    		init(this, options, instance$h, create_fragment$h, safe_not_equal, {});
    	}
    }

    const FavoritesStores = writable([]);

    const addUpdateFavorite = async (fav) => {
      const { data } = await axios.post("/api/files/favorites/add-edit", fav);
      if (data.Id) {
        FavoritesStores.update((favs) => {
          return (favs = [...favs.filter((f) => f.Id !== fav.Id), data].sort((f1, f2) =>
            f1.Name.localeCompare(f2.Name)
          ));
        });
      }
      return data;
    };

    const removeFavorite = async (Id, Type) => {
      const { data } = await axios.delete("/api/files/favorites/remove", {
        data: { Id, Type },
      });
      console.log(data);
      if (data.removed) {
        FavoritesStores.update((favs) => (favs = favs.filter((fav) => fav.Id !== Id)));
      }
      return data;
    };

    /* src\User\pages\Home.svelte generated by Svelte v3.49.0 */

    function get_each_context$5(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[10] = list[i].Id;
    	child_ctx[11] = list[i].Name;
    	child_ctx[12] = list[i].Type;
    	child_ctx[13] = list[i].Cover;
    	child_ctx[14] = list[i].FileCount;
    	child_ctx[15] = list[i].FilesType;
    	child_ctx[17] = i;
    	return child_ctx;
    }

    // (78:6) {#each files as { Id, Name, Type, Cover, FileCount, FilesType }
    function create_each_block$5(ctx) {
    	let div4;
    	let div3;
    	let div0;
    	let span0;
    	let t0;
    	let span1;
    	let t1_value = /*FileCount*/ ctx[14] + "";
    	let t1;
    	let t2;
    	let span2;
    	let t3;
    	let div1;
    	let img;
    	let img_src_value;
    	let t4;
    	let div2;
    	let t5_value = /*Name*/ ctx[11] + "";
    	let t5;
    	let t6;
    	let div4_id_value;
    	let div4_data_type_value;
    	let div4_data_types_value;
    	let mounted;
    	let dispose;

    	return {
    		c() {
    			div4 = element("div");
    			div3 = element("div");
    			div0 = element("div");
    			span0 = element("span");
    			span0.innerHTML = `<i class="${"fas fa-folder"} svelte-f0bvf6"></i>`;
    			t0 = space();
    			span1 = element("span");
    			t1 = text(t1_value);
    			t2 = space();
    			span2 = element("span");
    			span2.innerHTML = `<i class="fas fa-trash-alt svelte-f0bvf6"></i>`;
    			t3 = space();
    			div1 = element("div");
    			img = element("img");
    			t4 = space();
    			div2 = element("div");
    			t5 = text(t5_value);
    			t6 = space();
    			attr(span0, "class", "file-btn-left");
    			attr(span1, "class", "file-progress");
    			attr(span2, "class", "remove");
    			attr(div0, "class", "file-btns");
    			if (!src_url_equal(img.src, img_src_value = /*Cover*/ ctx[13])) attr(img, "src", img_src_value);
    			attr(img, "alt", "No Cover Found");
    			attr(div1, "class", "file-cover");
    			attr(div2, "class", "file-name");
    			attr(div3, "class", "file-info");
    			attr(div4, "class", "file");
    			attr(div4, "id", div4_id_value = /*Id*/ ctx[10]);
    			attr(div4, "data-type", div4_data_type_value = /*Type*/ ctx[12]);
    			attr(div4, "data-types", div4_data_types_value = /*FilesType*/ ctx[15]);
    			attr(div4, "tabindex", "0");
    			toggle_class(div4, "current", /*i*/ ctx[17] === /*current*/ ctx[1]);
    		},
    		m(target, anchor) {
    			insert(target, div4, anchor);
    			append(div4, div3);
    			append(div3, div0);
    			append(div0, span0);
    			append(div0, t0);
    			append(div0, span1);
    			append(span1, t1);
    			append(div0, t2);
    			append(div0, span2);
    			append(div3, t3);
    			append(div3, div1);
    			append(div1, img);
    			append(div3, t4);
    			append(div3, div2);
    			append(div2, t5);
    			append(div4, t6);

    			if (!mounted) {
    				dispose = [
    					listen(span0, "click", stop_propagation(/*openFolder*/ ctx[4])),
    					listen(div1, "dblclick", stop_propagation(/*openFolder*/ ctx[4]))
    				];

    				mounted = true;
    			}
    		},
    		p(ctx, dirty) {
    			if (dirty & /*files*/ 1 && t1_value !== (t1_value = /*FileCount*/ ctx[14] + "")) set_data(t1, t1_value);

    			if (dirty & /*files*/ 1 && !src_url_equal(img.src, img_src_value = /*Cover*/ ctx[13])) {
    				attr(img, "src", img_src_value);
    			}

    			if (dirty & /*files*/ 1 && t5_value !== (t5_value = /*Name*/ ctx[11] + "")) set_data(t5, t5_value);

    			if (dirty & /*files*/ 1 && div4_id_value !== (div4_id_value = /*Id*/ ctx[10])) {
    				attr(div4, "id", div4_id_value);
    			}

    			if (dirty & /*files*/ 1 && div4_data_type_value !== (div4_data_type_value = /*Type*/ ctx[12])) {
    				attr(div4, "data-type", div4_data_type_value);
    			}

    			if (dirty & /*files*/ 1 && div4_data_types_value !== (div4_data_types_value = /*FilesType*/ ctx[15])) {
    				attr(div4, "data-types", div4_data_types_value);
    			}

    			if (dirty & /*current*/ 2) {
    				toggle_class(div4, "current", /*i*/ ctx[17] === /*current*/ ctx[1]);
    			}
    		},
    		d(detaching) {
    			if (detaching) detach(div4);
    			mounted = false;
    			run_all(dispose);
    		}
    	};
    }

    function create_fragment$g(ctx) {
    	let div3;
    	let div0;
    	let t1;
    	let div2;
    	let span1;
    	let t2;
    	let div1;
    	let t3;
    	let span2;
    	let mounted;
    	let dispose;
    	let each_value = /*files*/ ctx[0];
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$5(get_each_context$5(ctx, each_value, i));
    	}

    	return {
    		c() {
    			div3 = element("div");
    			div0 = element("div");

    			div0.innerHTML = `<span class="svelte-f0bvf6"><i class="fas fa-folder svelte-f0bvf6"></i>
      Recents</span>`;

    			t1 = space();
    			div2 = element("div");
    			span1 = element("span");
    			t2 = space();
    			div1 = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t3 = space();
    			span2 = element("span");
    			attr(div0, "class", "title svelte-f0bvf6");
    			attr(span1, "class", "fas fa-chevron-circle-left svelte-f0bvf6");
    			attr(div1, "class", "carousel svelte-f0bvf6");
    			attr(div1, "tabindex", "0");
    			attr(span2, "class", "fas fa-chevron-circle-right svelte-f0bvf6");
    			attr(div2, "class", "wrapper svelte-f0bvf6");
    			attr(div3, "class", "content svelte-f0bvf6");
    		},
    		m(target, anchor) {
    			insert(target, div3, anchor);
    			append(div3, div0);
    			append(div3, t1);
    			append(div3, div2);
    			append(div2, span1);
    			append(div2, t2);
    			append(div2, div1);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div1, null);
    			}

    			/*div1_binding*/ ctx[6](div1);
    			append(div2, t3);
    			append(div2, span2);

    			if (!mounted) {
    				dispose = [
    					listen(span1, "click", /*scrollItems*/ ctx[3]),
    					listen(div1, "scroll", /*onScroll*/ ctx[5]),
    					listen(span2, "click", /*scrollItems*/ ctx[3])
    				];

    				mounted = true;
    			}
    		},
    		p(ctx, [dirty]) {
    			if (dirty & /*files, current, openFolder*/ 19) {
    				each_value = /*files*/ ctx[0];
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$5(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block$5(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(div1, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}
    		},
    		i: noop,
    		o: noop,
    		d(detaching) {
    			if (detaching) detach(div3);
    			destroy_each(each_blocks, detaching);
    			/*div1_binding*/ ctx[6](null);
    			mounted = false;
    			run_all(dispose);
    		}
    	};
    }

    function instance$g($$self, $$props, $$invalidate) {
    	let files = [];
    	let current = 0;
    	let container;

    	axios.get("/api/files/recents").then(({ data }) => {
    		if (data instanceof Array) {
    			$$invalidate(0, files = data);
    		}
    	});

    	const scrollItems = ({ target: { classList } }) => {
    		let left;
    		let behavior = "smooth";
    		let { scrollLeft, offsetWidth, scrollWidth } = container;

    		if (classList.contains("fa-chevron-circle-left")) {
    			left = scrollLeft - offsetWidth;

    			if (scrollLeft === 0) {
    				left = scrollWidth;
    			}
    		} else {
    			left = scrollLeft + offsetWidth;

    			if (scrollLeft === scrollWidth - offsetWidth) {
    				left = 0;
    			}
    		}

    		container.scroll({ left, behavior });
    	};

    	const openFolder = ({ target }) => {
    		let file = files.find(f => f.Id === target.closest(".file").id);
    		localStorage.setItem("content", "/");
    		navigate(`/${file.FilesType}/viewer/${file.Id}/${file.CurrentFile}`);
    	};

    	let tscroll;

    	const onScroll = e => {
    		if (tscroll) clearTimeout(tscroll);

    		tscroll = setTimeout(
    			() => {
    				let el = document.querySelector(".file");
    				$$invalidate(1, current = Math.round(container.scrollLeft / el.offsetWidth + 0.05));

    				container.scroll({
    					left: current * el.offsetWidth,
    					behavior: "smooth"
    				});
    			},
    			100
    		);
    	};

    	const resize = () => {
    		if (container) {
    			let tFile = document.querySelector(".file");
    			if (tFile) container.offsetWidth / tFile.offsetWidth;
    		}
    	};

    	onMount(() => {
    		resize();
    		window.onresize = resize;

    		return () => {
    			window.onresize = null;
    		};
    	});

    	function div1_binding($$value) {
    		binding_callbacks[$$value ? 'unshift' : 'push'](() => {
    			container = $$value;
    			$$invalidate(2, container);
    		});
    	}

    	return [files, current, container, scrollItems, openFolder, onScroll, div1_binding];
    }

    class Home extends SvelteComponent {
    	constructor(options) {
    		super();
    		init(this, options, instance$g, create_fragment$g, safe_not_equal, {});
    	}
    }

    const scrollInView = (num) => {
        let currentimg = document.querySelectorAll(".img-current img")[num];
        if (currentimg) {
            currentimg.scrollIntoView();
        }
    };

    // get a list of index of empty place of the array
    const getEmptyIndex = function (arr, from, to, dir, size) {
        let index = from < 0 ? 0 : from;
        let items = [];
        while (items.length < to) {
            //check if is out of bound
            if (index > size - 1 || index < 0) break;
            // if is empty add index
            if (!arr[index]) items.push(index);
            //increase or decrease depending on direction
            index += dir > 0 ? 1 : -1;
        }
        return items;
    };

    function formatTime(time) {
        if (time === 0) return "00:00";

        var h = Math.floor(time / 3600);
        var min = Math.floor((time / 3600 - h) * 60);
        var sec = Math.floor(time % 60);
        return (
            (h === 0 ? "" : h + ":") +
            String(min).padStart(2, "0") +
            ":" +
            String(sec).padStart(2, "0")
        );
    }

    const isMobile = /(android)|(iphone)/i.test(navigator.userAgent);
    const scrollW = isMobile ? 15 : 0;
    const itemW = isMobile ? 170 : 200;

    const getFilesPerPage = (i) => {
        let fwidth = document.body.offsetWidth;
        let items = parseInt((fwidth - scrollW) / itemW);
        return items * i;
    };

    const genUrl = (page = 1, { order = "nu", items }, filter, type, id, dir) => {
        let itemsperpage = (items || 0) === 0 ? getFilesPerPage(3) : items;
        if (type.includes("content")) {
            type = `folder-content/${id}`;
        }

        filter = (filter || "").replace("%", " ");
        let url = "";
        if (["mangas", "videos"].includes(type)) {
            url = `/api/files/${type}/${dir}/${order}/${page}/${itemsperpage}/${filter}`;
        } else {
            url = `/api/files/${type}/${order}/${page}/${itemsperpage}/${filter}`;
        }
        return url;
    };

    const FileTypes = {
        Manga: {
            type: "mangas",
            class: "book-open",
            formatter: (a, b) => `${parseInt(a || 0) + 1}/${b}`,
        },
        Video: {
            type: "videos",
            class: "play-circle",
            formatter: (a, b) => `${formatTime(a)}/${formatTime(b)}`,
        },
        Folder: {
            type: "folders",
            class: "folder-open",
            formatter() {
                return "";
            },
        },
    };

    const ProcessFile = (file, socket, type) => {
        const curPath = location.pathname;
        let Type = curPath.replace(/(^\/+|\/+$)/g, "").split("/")[0];
        switch (file.dataset.type) {
            case "Manga":
            case "Video": {
                let segment = curPath
                    .replace(/(^\/+|\/+$)/g, "")
                    .split("/")
                    .slice(0, 3);
                segment[1] = "viewer";
                let url = `/${segment.join("/")}/${file.id}`;
                localStorage.setItem("content", curPath);
                localStorage.setItem("fileId", file.id);
                navigate(url);
                console.log(segment[2]);
                if (socket)
                    socket.emit("recent-folder", {
                        CurrentFile: file.id,
                        FolderId: segment[2],
                    });
                break;
            }
            default: {
                localStorage.setObject("folder", {
                    folder: file.id,
                    pathname: curPath,
                });
                navigate(`/${type || Type}/content/${file.id}/`);
            }
        }
    };

    const map = function (value, in_min, in_max, out_min, out_max) {
        return ((value - in_min) * (out_max - out_min)) / (in_max - in_min) + out_min;
    };

    const UP = 38;
    const DOWN = 40;
    const LEFT = 37;
    const RIGHT = 39;
    const ENTER = 13;
    const HOME = 36;
    const END = 35;
    var selectedIndex = 0;

    const calCol = () => {
      let file = document.querySelector(".file");
      return Math.floor(file.parentElement.offsetWidth / file.offsetWidth);
    };

    const getElByIndex = (index) => {
      return [...document.querySelectorAll(".file")][index];
    };

    const getElIndex = (element) => {
      return [...document.querySelectorAll(".file")].indexOf(element);
    };

    const selectItem = (index) => {
      selectedIndex = index;
      let nextEl = getElByIndex(index);
      if (nextEl) {
        let itemContainer = nextEl.parentElement;
        let scrollElement = itemContainer.parentElement;
        let scroll = scrollElement.scrollTop,
          elofft = nextEl.offsetTop;

        if (elofft - scroll + 1 < -1) {
          scroll = elofft < 60 ? 0 : elofft;
        }

        let top = elofft + nextEl.offsetHeight;
        let sctop = scroll + scrollElement.offsetHeight;

        if (top - sctop + 1 > 0) {
          scroll =
            top + 31 > itemContainer.offsetHeight
              ? itemContainer.offsetHeight - 10
              : scroll + (top - sctop);
        }

        scrollElement.scroll({
          top: scroll,
          behavior: "smooth",
        });

        let activeEl = document.querySelector(".file.active");

        if (activeEl) activeEl.classList.remove("active");

        nextEl.classList.add("active");
        nextEl.focus();
        window.localStorage.setItem("selected", index);
      }
      return nextEl;
    };

    const fileClicks = (event) => {
      let file = event.target.closest(".file");
      selectItem(getElIndex(file));
    };

    const fileKeypress = (e, page, goToPage, processFile) => {
      let file = document.querySelector(".file");
      let selected = 0;
      if (file) {
        let wasProcesed = false;
        let colNum = calCol();
        let totalitem = document.querySelectorAll(".file").length;
        selectedIndex = getElIndex(file.parentElement.querySelector(".active"));
        switch (e.keyCode) {
          case ENTER: {
            console.log("file", e.target);
            processFile(e.target);
            break;
          }
          case LEFT: {
            if (selectedIndex > 0) {
              selectItem(selectedIndex - 1);
            } else if (goToPage) {
              selected = getFilesPerPage(3) - 1;
              goToPage({ detail: page - 1 }, selected);
            }

            wasProcesed = true;
            break;
          }
          case UP: {
            if (goToPage && e.ctrlKey) {
              selected = getFilesPerPage(3) - 1;
              goToPage({ detail: page - 1 }, selected);
            } else if (selectedIndex - colNum >= 0) {
              selectItem(selectedIndex - colNum);
            }
            wasProcesed = true;
            break;
          }
          case RIGHT: {
            if (selectedIndex < totalitem - 1) {
              selectItem(selectedIndex + 1);
            } else if (goToPage) {
              goToPage({ detail: parseInt(page) + 1 }, 0);
            }

            wasProcesed = true;
            break;
          }

          case DOWN: {
            if (goToPage && e.ctrlKey) {
              goToPage({ detail: parseInt(page) + 1 }, 0);
            } else if (selectedIndex + colNum < totalitem) {
              selectItem(selectedIndex + colNum);
            }
            wasProcesed = true;
            break;
          }
          case HOME: {
            selectItem(0);
            wasProcesed = true;
            break;
          }
          case END: {
            selectItem(totalitem - 1);
            wasProcesed = true;
            break;
          }
        }

        if (wasProcesed) {
          e.preventDefault();
        }
      }
    };

    /* src\User\Component\FavoriteList.svelte generated by Svelte v3.49.0 */

    function get_each_context$4(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[13] = list[i];
    	return child_ctx;
    }

    // (84:4) {#if Type === 'Folder'}
    function create_if_block_1$3(ctx) {
    	let show_if;
    	let if_block_anchor;

    	function select_block_type(ctx, dirty) {
    		if (dirty & /*type*/ 2) show_if = null;
    		if (show_if == null) show_if = !!/*type*/ ctx[1].startsWith('favorites');
    		if (show_if) return create_if_block_2$2;
    		if (/*isFav*/ ctx[2]) return create_if_block_3;
    		return create_else_block$3;
    	}

    	let current_block_type = select_block_type(ctx, -1);
    	let if_block = current_block_type(ctx);

    	return {
    		c() {
    			if_block.c();
    			if_block_anchor = empty$1();
    		},
    		m(target, anchor) {
    			if_block.m(target, anchor);
    			insert(target, if_block_anchor, anchor);
    		},
    		p(ctx, dirty) {
    			if (current_block_type === (current_block_type = select_block_type(ctx, dirty)) && if_block) {
    				if_block.p(ctx, dirty);
    			} else {
    				if_block.d(1);
    				if_block = current_block_type(ctx);

    				if (if_block) {
    					if_block.c();
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			}
    		},
    		d(detaching) {
    			if_block.d(detaching);
    			if (detaching) detach(if_block_anchor);
    		}
    	};
    }

    // (89:6) {:else}
    function create_else_block$3(ctx) {
    	let i;

    	return {
    		c() {
    			i = element("i");
    			attr(i, "class", "far fa-star");
    		},
    		m(target, anchor) {
    			insert(target, i, anchor);
    			/*i_binding_1*/ ctx[10](i);
    		},
    		p: noop,
    		d(detaching) {
    			if (detaching) detach(i);
    			/*i_binding_1*/ ctx[10](null);
    		}
    	};
    }

    // (87:22) 
    function create_if_block_3(ctx) {
    	let i;

    	return {
    		c() {
    			i = element("i");
    			attr(i, "class", "fas fa-star");
    		},
    		m(target, anchor) {
    			insert(target, i, anchor);
    		},
    		p: noop,
    		d(detaching) {
    			if (detaching) detach(i);
    		}
    	};
    }

    // (85:6) {#if type.startsWith('favorites')}
    function create_if_block_2$2(ctx) {
    	let i;

    	return {
    		c() {
    			i = element("i");
    			attr(i, "class", "fas fa-trash-alt text-danger");
    		},
    		m(target, anchor) {
    			insert(target, i, anchor);
    			/*i_binding*/ ctx[9](i);
    		},
    		p: noop,
    		d(detaching) {
    			if (detaching) detach(i);
    			/*i_binding*/ ctx[9](null);
    		}
    	};
    }

    // (94:2) {#if showList}
    function create_if_block$7(ctx) {
    	let ul;
    	let each_value = /*$FavoritesStores*/ ctx[5];
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$4(get_each_context$4(ctx, each_value, i));
    	}

    	return {
    		c() {
    			ul = element("ul");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr(ul, "class", "svelte-5vo8z2");
    		},
    		m(target, anchor) {
    			insert(target, ul, anchor);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(ul, null);
    			}
    		},
    		p(ctx, dirty) {
    			if (dirty & /*$FavoritesStores, addToFav*/ 96) {
    				each_value = /*$FavoritesStores*/ ctx[5];
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$4(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block$4(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(ul, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}
    		},
    		d(detaching) {
    			if (detaching) detach(ul);
    			destroy_each(each_blocks, detaching);
    		}
    	};
    }

    // (96:6) {#each $FavoritesStores as fav}
    function create_each_block$4(ctx) {
    	let li;
    	let t_value = /*fav*/ ctx[13].Name + "";
    	let t;
    	let li_id_value;
    	let mounted;
    	let dispose;

    	return {
    		c() {
    			li = element("li");
    			t = text(t_value);
    			attr(li, "id", li_id_value = /*fav*/ ctx[13].Id);
    			attr(li, "class", "svelte-5vo8z2");
    		},
    		m(target, anchor) {
    			insert(target, li, anchor);
    			append(li, t);

    			if (!mounted) {
    				dispose = listen(li, "click", /*addToFav*/ ctx[6]);
    				mounted = true;
    			}
    		},
    		p(ctx, dirty) {
    			if (dirty & /*$FavoritesStores*/ 32 && t_value !== (t_value = /*fav*/ ctx[13].Name + "")) set_data(t, t_value);

    			if (dirty & /*$FavoritesStores*/ 32 && li_id_value !== (li_id_value = /*fav*/ ctx[13].Id)) {
    				attr(li, "id", li_id_value);
    			}
    		},
    		d(detaching) {
    			if (detaching) detach(li);
    			mounted = false;
    			dispose();
    		}
    	};
    }

    function create_fragment$f(ctx) {
    	let span1;
    	let span0;
    	let t;
    	let if_block0 = /*Type*/ ctx[0] === 'Folder' && create_if_block_1$3(ctx);
    	let if_block1 = /*showList*/ ctx[4] && create_if_block$7(ctx);

    	return {
    		c() {
    			span1 = element("span");
    			span0 = element("span");
    			if (if_block0) if_block0.c();
    			t = space();
    			if (if_block1) if_block1.c();
    			attr(span0, "class", "fav-icon");
    			attr(span1, "class", "fav-control svelte-5vo8z2");
    		},
    		m(target, anchor) {
    			insert(target, span1, anchor);
    			append(span1, span0);
    			if (if_block0) if_block0.m(span0, null);
    			append(span1, t);
    			if (if_block1) if_block1.m(span1, null);
    		},
    		p(ctx, [dirty]) {
    			if (/*Type*/ ctx[0] === 'Folder') {
    				if (if_block0) {
    					if_block0.p(ctx, dirty);
    				} else {
    					if_block0 = create_if_block_1$3(ctx);
    					if_block0.c();
    					if_block0.m(span0, null);
    				}
    			} else if (if_block0) {
    				if_block0.d(1);
    				if_block0 = null;
    			}

    			if (/*showList*/ ctx[4]) {
    				if (if_block1) {
    					if_block1.p(ctx, dirty);
    				} else {
    					if_block1 = create_if_block$7(ctx);
    					if_block1.c();
    					if_block1.m(span1, null);
    				}
    			} else if (if_block1) {
    				if_block1.d(1);
    				if_block1 = null;
    			}
    		},
    		i: noop,
    		o: noop,
    		d(detaching) {
    			if (detaching) detach(span1);
    			if (if_block0) if_block0.d();
    			if (if_block1) if_block1.d();
    		}
    	};
    }

    function instance$f($$self, $$props, $$invalidate) {
    	let $FavoritesStores;
    	component_subscribe($$self, FavoritesStores, $$value => $$invalidate(5, $FavoritesStores = $$value));
    	let { Type } = $$props;
    	let { type } = $$props;
    	let { isFav } = $$props;
    	let { favClicked } = $$props;
    	let { favId } = $$props;
    	const dispath = createEventDispatcher();
    	let thisEl;
    	let showList = false;

    	const addToFav = async event => {
    		let FolderId = event.target.closest(".file").id;
    		let FavoriteId = event.target.id;
    		const { data } = await axios.post("/api/files/favorites/add-folder", { FolderId, FavoriteId });

    		if (data.success) {
    			$$invalidate(3, thisEl.className = "fas fa-star", thisEl);
    		}
    	};

    	const removeFile = async FolderId => {
    		let { data } = await axios.post("/api/files/favorites/remove-folder", { id: favId, fid: FolderId });

    		if (data.removed) {
    			dispath("removeFile", FolderId);
    		}
    	};

    	function i_binding($$value) {
    		binding_callbacks[$$value ? 'unshift' : 'push'](() => {
    			thisEl = $$value;
    			$$invalidate(3, thisEl);
    		});
    	}

    	function i_binding_1($$value) {
    		binding_callbacks[$$value ? 'unshift' : 'push'](() => {
    			thisEl = $$value;
    			$$invalidate(3, thisEl);
    		});
    	}

    	$$self.$$set = $$props => {
    		if ('Type' in $$props) $$invalidate(0, Type = $$props.Type);
    		if ('type' in $$props) $$invalidate(1, type = $$props.type);
    		if ('isFav' in $$props) $$invalidate(2, isFav = $$props.isFav);
    		if ('favClicked' in $$props) $$invalidate(7, favClicked = $$props.favClicked);
    		if ('favId' in $$props) $$invalidate(8, favId = $$props.favId);
    	};

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*favClicked, thisEl*/ 136) {
    			if (favClicked === thisEl && thisEl) {
    				$$invalidate(4, showList = thisEl.classList.contains("far"));

    				if (thisEl.classList.contains("fa-trash-alt")) {
    					removeFile(thisEl.closest(".file").id);
    				}
    			} else {
    				$$invalidate(4, showList = false);
    			}
    		}
    	};

    	return [
    		Type,
    		type,
    		isFav,
    		thisEl,
    		showList,
    		$FavoritesStores,
    		addToFav,
    		favClicked,
    		favId,
    		i_binding,
    		i_binding_1
    	];
    }

    class FavoriteList extends SvelteComponent {
    	constructor(options) {
    		super();

    		init(this, options, instance$f, create_fragment$f, safe_not_equal, {
    			Type: 0,
    			type: 1,
    			isFav: 2,
    			favClicked: 7,
    			favId: 8
    		});
    	}
    }

    /* src\User\Component\FilesList.svelte generated by Svelte v3.49.0 */

    function get_each_context$3(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[30] = list[i].Id;
    	child_ctx[31] = list[i].Name;
    	child_ctx[32] = list[i].Type;
    	child_ctx[33] = list[i].Cover;
    	child_ctx[34] = list[i].CurrentPos;
    	child_ctx[35] = list[i].Duration;
    	child_ctx[36] = list[i].isFav;
    	child_ctx[37] = list[i].FileCount;
    	child_ctx[39] = i;
    	return child_ctx;
    }

    // (143:2) {#if isContent}
    function create_if_block_1$2(ctx) {
    	let div2;
    	let div0;
    	let img;
    	let img_src_value;
    	let t0;
    	let h4;
    	let t1_value = /*folder*/ ctx[6].Name + "";
    	let t1;
    	let t2;
    	let div1;
    	let t3;
    	let button0;
    	let t5;
    	let button1;
    	let t7;
    	let button2;
    	let t9;
    	let button3;
    	let mounted;
    	let dispose;
    	let if_block = /*lastRead*/ ctx[7] && create_if_block_2$1(ctx);

    	return {
    		c() {
    			div2 = element("div");
    			div0 = element("div");
    			img = element("img");
    			t0 = space();
    			h4 = element("h4");
    			t1 = text(t1_value);
    			t2 = space();
    			div1 = element("div");
    			if (if_block) if_block.c();
    			t3 = space();
    			button0 = element("button");
    			button0.textContent = "First";
    			t5 = space();
    			button1 = element("button");
    			button1.textContent = "Last";
    			t7 = space();
    			button2 = element("button");
    			button2.textContent = "Reset All";
    			t9 = space();
    			button3 = element("button");
    			button3.textContent = "Update";
    			if (!src_url_equal(img.src, img_src_value = /*folder*/ ctx[6].Cover)) attr(img, "src", img_src_value);
    			attr(img, "alt", "Place Holder");
    			attr(img, "class", "svelte-5zjxis");
    			attr(div0, "id", "img-info");
    			attr(div0, "class", "svelte-5zjxis");
    			attr(h4, "class", "svelte-5zjxis");
    			attr(button0, "id", "first");
    			attr(button0, "class", "btn btn-secondary");
    			attr(button1, "id", "last");
    			attr(button1, "class", "btn btn-secondary");
    			attr(button2, "class", "btn btn-secondary");
    			attr(button3, "class", "btn btn-secondary");
    			attr(div1, "id", "btn-bar");
    			attr(div2, "id", "info");
    			attr(div2, "class", "svelte-5zjxis");
    		},
    		m(target, anchor) {
    			insert(target, div2, anchor);
    			append(div2, div0);
    			append(div0, img);
    			append(div2, t0);
    			append(div2, h4);
    			append(h4, t1);
    			append(div2, t2);
    			append(div2, div1);
    			if (if_block) if_block.m(div1, null);
    			append(div1, t3);
    			append(div1, button0);
    			append(div1, t5);
    			append(div1, button1);
    			append(div1, t7);
    			append(div1, button2);
    			append(div1, t9);
    			append(div1, button3);

    			if (!mounted) {
    				dispose = [
    					listen(button0, "click", /*openFirstLast*/ ctx[12]),
    					listen(button1, "click", /*openFirstLast*/ ctx[12]),
    					listen(button2, "click", /*onResetFiles*/ ctx[17]),
    					listen(button3, "click", /*scanfiles*/ ctx[16])
    				];

    				mounted = true;
    			}
    		},
    		p(ctx, dirty) {
    			if (dirty[0] & /*folder*/ 64 && !src_url_equal(img.src, img_src_value = /*folder*/ ctx[6].Cover)) {
    				attr(img, "src", img_src_value);
    			}

    			if (dirty[0] & /*folder*/ 64 && t1_value !== (t1_value = /*folder*/ ctx[6].Name + "")) set_data(t1, t1_value);

    			if (/*lastRead*/ ctx[7]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);
    				} else {
    					if_block = create_if_block_2$1(ctx);
    					if_block.c();
    					if_block.m(div1, t3);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}
    		},
    		d(detaching) {
    			if (detaching) detach(div2);
    			if (if_block) if_block.d();
    			mounted = false;
    			run_all(dispose);
    		}
    	};
    }

    // (148:8) {#if lastRead}
    function create_if_block_2$1(ctx) {
    	let button;
    	let mounted;
    	let dispose;

    	return {
    		c() {
    			button = element("button");
    			button.textContent = "Continue";
    			attr(button, "class", "btn btn-secondary");
    		},
    		m(target, anchor) {
    			insert(target, button, anchor);

    			if (!mounted) {
    				dispose = listen(button, "click", /*continueReading*/ ctx[13]);
    				mounted = true;
    			}
    		},
    		p: noop,
    		d(detaching) {
    			if (detaching) detach(button);
    			mounted = false;
    			dispose();
    		}
    	};
    }

    // (169:14) {:else}
    function create_else_block$2(ctx) {
    	let t_value = FileTypes[/*Type*/ ctx[32]].formatter(/*CurrentPos*/ ctx[34], /*Duration*/ ctx[35]) + "";
    	let t;

    	return {
    		c() {
    			t = text(t_value);
    		},
    		m(target, anchor) {
    			insert(target, t, anchor);
    		},
    		p(ctx, dirty) {
    			if (dirty[0] & /*pageData*/ 16 && t_value !== (t_value = FileTypes[/*Type*/ ctx[32]].formatter(/*CurrentPos*/ ctx[34], /*Duration*/ ctx[35]) + "")) set_data(t, t_value);
    		},
    		d(detaching) {
    			if (detaching) detach(t);
    		}
    	};
    }

    // (167:14) {#if Type.includes("Folder")}
    function create_if_block$6(ctx) {
    	let t_value = /*FileCount*/ ctx[37] + "";
    	let t;

    	return {
    		c() {
    			t = text(t_value);
    		},
    		m(target, anchor) {
    			insert(target, t, anchor);
    		},
    		p(ctx, dirty) {
    			if (dirty[0] & /*pageData*/ 16 && t_value !== (t_value = /*FileCount*/ ctx[37] + "")) set_data(t, t_value);
    		},
    		d(detaching) {
    			if (detaching) detach(t);
    		}
    	};
    }

    // (159:4) {#each pageData.files as { Id, Name, Type, Cover, CurrentPos, Duration, isFav, FileCount }
    function create_each_block$3(ctx) {
    	let div4;
    	let div3;
    	let div0;
    	let span0;
    	let i_1;
    	let i_1_class_value;
    	let t0;
    	let span1;
    	let show_if;
    	let t1;
    	let favoritelist;
    	let t2;
    	let div1;
    	let img;
    	let img_src_value;
    	let t3;
    	let div2;
    	let t4_value = /*Name*/ ctx[31] + "";
    	let t4;
    	let t5;
    	let div4_id_value;
    	let div4_data_type_value;
    	let div4_intro;
    	let current;
    	let mounted;
    	let dispose;

    	function select_block_type(ctx, dirty) {
    		if (dirty[0] & /*pageData*/ 16) show_if = null;
    		if (show_if == null) show_if = !!/*Type*/ ctx[32].includes("Folder");
    		if (show_if) return create_if_block$6;
    		return create_else_block$2;
    	}

    	let current_block_type = select_block_type(ctx, [-1, -1]);
    	let if_block = current_block_type(ctx);

    	favoritelist = new FavoriteList({
    			props: {
    				isFav: /*isFav*/ ctx[36],
    				type: /*type*/ ctx[3],
    				Type: /*Type*/ ctx[32],
    				favClicked: /*favClicked*/ ctx[5],
    				favId: /*id*/ ctx[2]
    			}
    		});

    	favoritelist.$on("removeFile", /*removeFile*/ ctx[15]);

    	return {
    		c() {
    			div4 = element("div");
    			div3 = element("div");
    			div0 = element("div");
    			span0 = element("span");
    			i_1 = element("i");
    			t0 = space();
    			span1 = element("span");
    			if_block.c();
    			t1 = space();
    			create_component(favoritelist.$$.fragment);
    			t2 = space();
    			div1 = element("div");
    			img = element("img");
    			t3 = space();
    			div2 = element("div");
    			t4 = text(t4_value);
    			t5 = space();
    			attr(i_1, "class", i_1_class_value = "" + (null_to_empty("fas fa-" + FileTypes[/*Type*/ ctx[32]].class) + " svelte-5zjxis"));
    			attr(span0, "class", "file-btn-left svelte-5zjxis");
    			attr(span1, "class", "file-progress");
    			attr(div0, "class", "file-btns");
    			if (!src_url_equal(img.src, img_src_value = /*Cover*/ ctx[33])) attr(img, "src", img_src_value);
    			attr(img, "alt", "No Cover Found");
    			attr(img, "class", "svelte-5zjxis");
    			attr(div1, "class", "file-cover");
    			attr(div2, "class", "file-name");
    			attr(div3, "class", "file-info");
    			attr(div4, "class", "file svelte-5zjxis");
    			attr(div4, "id", div4_id_value = /*Id*/ ctx[30]);
    			attr(div4, "data-type", div4_data_type_value = /*Type*/ ctx[32]);
    			attr(div4, "tabindex", "0");
    		},
    		m(target, anchor) {
    			insert(target, div4, anchor);
    			append(div4, div3);
    			append(div3, div0);
    			append(div0, span0);
    			append(span0, i_1);
    			append(div0, t0);
    			append(div0, span1);
    			if_block.m(span1, null);
    			append(div0, t1);
    			mount_component(favoritelist, div0, null);
    			append(div3, t2);
    			append(div3, div1);
    			append(div1, img);
    			append(div3, t3);
    			append(div3, div2);
    			append(div2, t4);
    			append(div4, t5);
    			current = true;

    			if (!mounted) {
    				dispose = [
    					listen(span0, "click", stop_propagation(/*openFile*/ ctx[11])),
    					listen(div1, "dblclick", stop_propagation(/*openFile*/ ctx[11]))
    				];

    				mounted = true;
    			}
    		},
    		p(ctx, dirty) {
    			if (!current || dirty[0] & /*pageData*/ 16 && i_1_class_value !== (i_1_class_value = "" + (null_to_empty("fas fa-" + FileTypes[/*Type*/ ctx[32]].class) + " svelte-5zjxis"))) {
    				attr(i_1, "class", i_1_class_value);
    			}

    			if (current_block_type === (current_block_type = select_block_type(ctx, dirty)) && if_block) {
    				if_block.p(ctx, dirty);
    			} else {
    				if_block.d(1);
    				if_block = current_block_type(ctx);

    				if (if_block) {
    					if_block.c();
    					if_block.m(span1, null);
    				}
    			}

    			const favoritelist_changes = {};
    			if (dirty[0] & /*pageData*/ 16) favoritelist_changes.isFav = /*isFav*/ ctx[36];
    			if (dirty[0] & /*type*/ 8) favoritelist_changes.type = /*type*/ ctx[3];
    			if (dirty[0] & /*pageData*/ 16) favoritelist_changes.Type = /*Type*/ ctx[32];
    			if (dirty[0] & /*favClicked*/ 32) favoritelist_changes.favClicked = /*favClicked*/ ctx[5];
    			if (dirty[0] & /*id*/ 4) favoritelist_changes.favId = /*id*/ ctx[2];
    			favoritelist.$set(favoritelist_changes);

    			if (!current || dirty[0] & /*pageData*/ 16 && !src_url_equal(img.src, img_src_value = /*Cover*/ ctx[33])) {
    				attr(img, "src", img_src_value);
    			}

    			if ((!current || dirty[0] & /*pageData*/ 16) && t4_value !== (t4_value = /*Name*/ ctx[31] + "")) set_data(t4, t4_value);

    			if (!current || dirty[0] & /*pageData*/ 16 && div4_id_value !== (div4_id_value = /*Id*/ ctx[30])) {
    				attr(div4, "id", div4_id_value);
    			}

    			if (!current || dirty[0] & /*pageData*/ 16 && div4_data_type_value !== (div4_data_type_value = /*Type*/ ctx[32])) {
    				attr(div4, "data-type", div4_data_type_value);
    			}
    		},
    		i(local) {
    			if (current) return;
    			transition_in(favoritelist.$$.fragment, local);

    			if (!div4_intro) {
    				add_render_callback(() => {
    					div4_intro = create_in_transition(div4, fade, {});
    					div4_intro.start();
    				});
    			}

    			current = true;
    		},
    		o(local) {
    			transition_out(favoritelist.$$.fragment, local);
    			current = false;
    		},
    		d(detaching) {
    			if (detaching) detach(div4);
    			if_block.d();
    			destroy_component(favoritelist);
    			mounted = false;
    			run_all(dispose);
    		}
    	};
    }

    function create_fragment$e(ctx) {
    	let div1;
    	let t0;
    	let div0;
    	let t1;
    	let div2;
    	let t2;
    	let filter_1;
    	let t3;
    	let pagination;
    	let t4;
    	let span;
    	let t5_value = /*pageData*/ ctx[4].totalFiles + "";
    	let t5;
    	let current;
    	let mounted;
    	let dispose;
    	let if_block = /*isContent*/ ctx[18] && create_if_block_1$2(ctx);
    	let each_value = /*pageData*/ ctx[4].files;
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$3(get_each_context$3(ctx, each_value, i));
    	}

    	const out = i => transition_out(each_blocks[i], 1, 1, () => {
    		each_blocks[i] = null;
    	});

    	const default_slot_template = /*#slots*/ ctx[22].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[21], null);
    	filter_1 = new Filter({ props: { filter: /*filter*/ ctx[1] } });
    	filter_1.$on("filter", /*fileFilter*/ ctx[9]);

    	pagination = new Pagination({
    			props: {
    				page: parseInt(/*page*/ ctx[0] || 1),
    				totalPages: /*pageData*/ ctx[4].totalPages
    			}
    		});

    	pagination.$on("gotopage", /*goToPage*/ ctx[8]);

    	return {
    		c() {
    			div1 = element("div");
    			if (if_block) if_block.c();
    			t0 = space();
    			div0 = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t1 = space();
    			div2 = element("div");
    			if (default_slot) default_slot.c();
    			t2 = space();
    			create_component(filter_1.$$.fragment);
    			t3 = space();
    			create_component(pagination.$$.fragment);
    			t4 = space();
    			span = element("span");
    			t5 = text(t5_value);
    			attr(div0, "class", "files-list svelte-5zjxis");
    			attr(div1, "class", "" + (null_to_empty("scroll-container") + " svelte-5zjxis"));
    			toggle_class(div1, "r-content", /*isContent*/ ctx[18]);
    			attr(span, "class", "items");
    			attr(div2, "class", "controls svelte-5zjxis");
    		},
    		m(target, anchor) {
    			insert(target, div1, anchor);
    			if (if_block) if_block.m(div1, null);
    			append(div1, t0);
    			append(div1, div0);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div0, null);
    			}

    			insert(target, t1, anchor);
    			insert(target, div2, anchor);

    			if (default_slot) {
    				default_slot.m(div2, null);
    			}

    			append(div2, t2);
    			mount_component(filter_1, div2, null);
    			append(div2, t3);
    			mount_component(pagination, div2, null);
    			append(div2, t4);
    			append(div2, span);
    			append(span, t5);
    			current = true;

    			if (!mounted) {
    				dispose = [
    					listen(div0, "keydown", /*handleKeydown*/ ctx[10]),
    					listen(div0, "click", /*favClick*/ ctx[14])
    				];

    				mounted = true;
    			}
    		},
    		p(ctx, dirty) {
    			if (/*isContent*/ ctx[18]) if_block.p(ctx, dirty);

    			if (dirty[0] & /*pageData, openFile, type, favClicked, id, removeFile*/ 34876) {
    				each_value = /*pageData*/ ctx[4].files;
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$3(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    						transition_in(each_blocks[i], 1);
    					} else {
    						each_blocks[i] = create_each_block$3(child_ctx);
    						each_blocks[i].c();
    						transition_in(each_blocks[i], 1);
    						each_blocks[i].m(div0, null);
    					}
    				}

    				group_outros();

    				for (i = each_value.length; i < each_blocks.length; i += 1) {
    					out(i);
    				}

    				check_outros();
    			}

    			if (default_slot) {
    				if (default_slot.p && (!current || dirty[0] & /*$$scope*/ 2097152)) {
    					update_slot_base(
    						default_slot,
    						default_slot_template,
    						ctx,
    						/*$$scope*/ ctx[21],
    						!current
    						? get_all_dirty_from_scope(/*$$scope*/ ctx[21])
    						: get_slot_changes(default_slot_template, /*$$scope*/ ctx[21], dirty, null),
    						null
    					);
    				}
    			}

    			const filter_1_changes = {};
    			if (dirty[0] & /*filter*/ 2) filter_1_changes.filter = /*filter*/ ctx[1];
    			filter_1.$set(filter_1_changes);
    			const pagination_changes = {};
    			if (dirty[0] & /*page*/ 1) pagination_changes.page = parseInt(/*page*/ ctx[0] || 1);
    			if (dirty[0] & /*pageData*/ 16) pagination_changes.totalPages = /*pageData*/ ctx[4].totalPages;
    			pagination.$set(pagination_changes);
    			if ((!current || dirty[0] & /*pageData*/ 16) && t5_value !== (t5_value = /*pageData*/ ctx[4].totalFiles + "")) set_data(t5, t5_value);
    		},
    		i(local) {
    			if (current) return;

    			for (let i = 0; i < each_value.length; i += 1) {
    				transition_in(each_blocks[i]);
    			}

    			transition_in(default_slot, local);
    			transition_in(filter_1.$$.fragment, local);
    			transition_in(pagination.$$.fragment, local);
    			current = true;
    		},
    		o(local) {
    			each_blocks = each_blocks.filter(Boolean);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				transition_out(each_blocks[i]);
    			}

    			transition_out(default_slot, local);
    			transition_out(filter_1.$$.fragment, local);
    			transition_out(pagination.$$.fragment, local);
    			current = false;
    		},
    		d(detaching) {
    			if (detaching) detach(div1);
    			if (if_block) if_block.d();
    			destroy_each(each_blocks, detaching);
    			if (detaching) detach(t1);
    			if (detaching) detach(div2);
    			if (default_slot) default_slot.d(detaching);
    			destroy_component(filter_1);
    			destroy_component(pagination);
    			mounted = false;
    			run_all(dispose);
    		}
    	};
    }

    function instance$e($$self, $$props, $$invalidate) {
    	let $PageConfig;
    	component_subscribe($$self, PageConfig, $$value => $$invalidate(20, $PageConfig = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	let { id = "" } = $$props;
    	let { page = 1 } = $$props;
    	let { filter = "" } = $$props;
    	let { type = "" } = $$props;
    	let { title = "" } = $$props;
    	const socket = getContext("socket");
    	const logout = getContext("logout");
    	const baseData = { files: [], totalPages: 0, totalFiles: 0 };
    	let pageData = baseData;
    	let selected = 0;
    	let favClicked = null;
    	let folder = {};
    	let lastRead = "";
    	const cancelToken = axios.CancelToken;
    	let cancel;

    	const loadContent = async (pg = 1, flt = "", curId = "", config, nType) => {
    		try {
    			if (cancel) {
    				cancel();
    			}

    			let url = genUrl(
    				pg,
    				{
    					items: config.items,
    					order: config.order[title] || "nu"
    				},
    				flt,
    				nType || type,
    				curId
    			);

    			let { data } = await axios.get(url, {
    				cancelToken: new cancelToken(function executor(c) {
    						cancel = c;
    					})
    			});

    			if (typeof data === "object") {
    				$$invalidate(4, pageData = data);

    				if (data.files[0]) {
    					$$invalidate(6, folder = data.files[0].Folder);
    				}

    				$$invalidate(7, lastRead = data.currentFile);
    				selected = pageData.files.findIndex(f => f.Id === lastRead) || 0;
    			} else {
    				logout();
    			}
    		} catch(error) {
    			console.log(error);
    		}
    	};

    	const goToPage = async (pg, sel) => {
    		pg = parseInt(pg.detail);
    		let { totalPages } = pageData;
    		if (pg < 1 || pg > totalPages || isNaN(pg)) return;
    		pg = pg < 1 ? 1 : pg > totalPages ? totalPages : pg;
    		navigate(`/${type}/${pg}/${filter || ""}`);
    		selected = sel || 0;
    	};

    	const fileFilter = event => {
    		$$invalidate(1, filter = event.detail);
    		navigate(`/${type}/${1}/${filter || ""}`);
    	};

    	const handleKeydown = event => {
    		fileKeypress(event, page, goToPage, ProcessFile);
    	};

    	const openFile = event => {
    		ProcessFile(event.target.closest(".file"), socket);
    	};

    	const openFirstLast = async ({ target: { id } }) => {
    		const { data } = await axios.get(`/api/files/first-last/${id}/${folder.Id}`);

    		ProcessFile(
    			{
    				id: data.Id,
    				dataset: { type: data.Type }
    			},
    			socket
    		);
    	};

    	const continueReading = async () => {
    		const { data } = await axios.get(`/api/files/file-data/${lastRead}`);

    		ProcessFile(
    			{
    				id: lastRead,
    				dataset: { type: data.Type }
    			},
    			socket
    		);
    	};

    	const favClick = event => {
    		let { target } = event;
    		fileClicks(event);
    		selected = getElIndex(target.closest(".file"));
    		$$invalidate(5, favClicked = target);
    	};

    	const removeFile = event => {
    		$$invalidate(4, pageData.files = pageData.files.filter(f => f.Id !== event.detail), pageData);

    		if (pageData.totalPages > 1) {
    			if (pageData.files.length === 0) {
    				$$invalidate(0, page -= 1);
    			}

    			loadContent(page, filter || "", $PageConfig);
    		} else {
    			$$invalidate(4, pageData);
    		}
    	};

    	const scanfiles = () => {
    		socket.emit("scan-dir", { Id: folder.Id, isFolder: true });
    	};

    	afterUpdate(() => {
    		let sel = selected;
    		let id = localStorage.getItem("fileId");
    		let el = document.getElementById(id);

    		if (id && el) {
    			sel = getElIndex(el);
    			localStorage.removeItem("fileId");
    		}

    		selectItem(sel);
    	});

    	const onResetFiles = async () => {
    		await loadContent(page, filter, id, $PageConfig, type);
    	};

    	let isContent = location.pathname.includes("content");

    	$$self.$$set = $$props => {
    		if ('id' in $$props) $$invalidate(2, id = $$props.id);
    		if ('page' in $$props) $$invalidate(0, page = $$props.page);
    		if ('filter' in $$props) $$invalidate(1, filter = $$props.filter);
    		if ('type' in $$props) $$invalidate(3, type = $$props.type);
    		if ('title' in $$props) $$invalidate(19, title = $$props.title);
    		if ('$$scope' in $$props) $$invalidate(21, $$scope = $$props.$$scope);
    	};

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty[0] & /*title, page*/ 524289) {
    			document.title = `${title} Page ${page || ""}`;
    		}

    		if ($$self.$$.dirty[0] & /*page, filter, id, $PageConfig, type*/ 1048591) {
    			loadContent(page, filter, id, $PageConfig, type);
    		}

    		if ($$self.$$.dirty[0] & /*pageData, page, type, filter*/ 27) {
    			if (pageData.totalPages && parseInt(page) > pageData.totalPages) {
    				navigate(`/${type}/${page - 1}/${filter || ""}`);
    			}
    		}
    	};

    	return [
    		page,
    		filter,
    		id,
    		type,
    		pageData,
    		favClicked,
    		folder,
    		lastRead,
    		goToPage,
    		fileFilter,
    		handleKeydown,
    		openFile,
    		openFirstLast,
    		continueReading,
    		favClick,
    		removeFile,
    		scanfiles,
    		onResetFiles,
    		isContent,
    		title,
    		$PageConfig,
    		$$scope,
    		slots
    	];
    }

    class FilesList extends SvelteComponent {
    	constructor(options) {
    		super();

    		init(
    			this,
    			options,
    			instance$e,
    			create_fragment$e,
    			safe_not_equal,
    			{
    				id: 2,
    				page: 0,
    				filter: 1,
    				type: 3,
    				title: 19
    			},
    			null,
    			[-1, -1]
    		);
    	}
    }

    /* src\User\pages\Mangas.svelte generated by Svelte v3.49.0 */

    function create_fragment$d(ctx) {
    	let fileslist;
    	let current;

    	fileslist = new FilesList({
    			props: {
    				title: "Mangas",
    				type: `mangas/${/*dir*/ ctx[0]}`,
    				filter: /*filter*/ ctx[2],
    				page: /*page*/ ctx[1]
    			}
    		});

    	return {
    		c() {
    			create_component(fileslist.$$.fragment);
    		},
    		m(target, anchor) {
    			mount_component(fileslist, target, anchor);
    			current = true;
    		},
    		p(ctx, [dirty]) {
    			const fileslist_changes = {};
    			if (dirty & /*dir*/ 1) fileslist_changes.type = `mangas/${/*dir*/ ctx[0]}`;
    			if (dirty & /*filter*/ 4) fileslist_changes.filter = /*filter*/ ctx[2];
    			if (dirty & /*page*/ 2) fileslist_changes.page = /*page*/ ctx[1];
    			fileslist.$set(fileslist_changes);
    		},
    		i(local) {
    			if (current) return;
    			transition_in(fileslist.$$.fragment, local);
    			current = true;
    		},
    		o(local) {
    			transition_out(fileslist.$$.fragment, local);
    			current = false;
    		},
    		d(detaching) {
    			destroy_component(fileslist, detaching);
    		}
    	};
    }

    function instance$d($$self, $$props, $$invalidate) {
    	let { dir = "" } = $$props;
    	let { page = 1 } = $$props;
    	let { filter = "" } = $$props;

    	$$self.$$set = $$props => {
    		if ('dir' in $$props) $$invalidate(0, dir = $$props.dir);
    		if ('page' in $$props) $$invalidate(1, page = $$props.page);
    		if ('filter' in $$props) $$invalidate(2, filter = $$props.filter);
    	};

    	return [dir, page, filter];
    }

    class Mangas extends SvelteComponent {
    	constructor(options) {
    		super();
    		init(this, options, instance$d, create_fragment$d, safe_not_equal, { dir: 0, page: 1, filter: 2 });
    	}
    }

    /* src\User\pages\Videos.svelte generated by Svelte v3.49.0 */

    function create_fragment$c(ctx) {
    	let fileslist;
    	let current;

    	fileslist = new FilesList({
    			props: {
    				title: 'Videos',
    				type: `videos/${/*dir*/ ctx[2] || '0'}`,
    				filter: /*filter*/ ctx[1],
    				page: /*page*/ ctx[0]
    			}
    		});

    	return {
    		c() {
    			create_component(fileslist.$$.fragment);
    		},
    		m(target, anchor) {
    			mount_component(fileslist, target, anchor);
    			current = true;
    		},
    		p(ctx, [dirty]) {
    			const fileslist_changes = {};
    			if (dirty & /*dir*/ 4) fileslist_changes.type = `videos/${/*dir*/ ctx[2] || '0'}`;
    			if (dirty & /*filter*/ 2) fileslist_changes.filter = /*filter*/ ctx[1];
    			if (dirty & /*page*/ 1) fileslist_changes.page = /*page*/ ctx[0];
    			fileslist.$set(fileslist_changes);
    		},
    		i(local) {
    			if (current) return;
    			transition_in(fileslist.$$.fragment, local);
    			current = true;
    		},
    		o(local) {
    			transition_out(fileslist.$$.fragment, local);
    			current = false;
    		},
    		d(detaching) {
    			destroy_component(fileslist, detaching);
    		}
    	};
    }

    function instance$c($$self, $$props, $$invalidate) {
    	let { page = 1 } = $$props;
    	let { filter = "" } = $$props;
    	let { dir = "" } = $$props;

    	$$self.$$set = $$props => {
    		if ('page' in $$props) $$invalidate(0, page = $$props.page);
    		if ('filter' in $$props) $$invalidate(1, filter = $$props.filter);
    		if ('dir' in $$props) $$invalidate(2, dir = $$props.dir);
    	};

    	return [page, filter, dir];
    }

    class Videos extends SvelteComponent {
    	constructor(options) {
    		super();
    		init(this, options, instance$c, create_fragment$c, safe_not_equal, { page: 0, filter: 1, dir: 2 });
    	}
    }

    /* src\User\Component\FavoriteManager.svelte generated by Svelte v3.49.0 */

    function get_each_context$2(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[11] = list[i];
    	return child_ctx;
    }

    // (218:20) {#each $FavoritesStores as fav}
    function create_each_block$2(ctx) {
    	let tr;
    	let td0;
    	let t0_value = /*fav*/ ctx[11].Name + "";
    	let t0;
    	let td0_data_title_value;
    	let t1;
    	let td1;
    	let span0;
    	let t2;
    	let span1;
    	let t3;
    	let tr_id_value;
    	let tr_class_value;
    	let mounted;
    	let dispose;

    	return {
    		c() {
    			tr = element("tr");
    			td0 = element("td");
    			t0 = text(t0_value);
    			t1 = space();
    			td1 = element("td");
    			span0 = element("span");
    			span0.innerHTML = `<i class="fas fa-edit svelte-35vezv"></i>`;
    			t2 = space();
    			span1 = element("span");
    			span1.innerHTML = `<i class="fas fa-trash-alt svelte-35vezv"></i>`;
    			t3 = space();
    			attr(td0, "data-title", td0_data_title_value = /*fav*/ ctx[11].Name);
    			attr(td0, "class", "svelte-35vezv");
    			attr(td1, "class", "svelte-35vezv");
    			attr(tr, "id", tr_id_value = /*fav*/ ctx[11].Id);
    			attr(tr, "class", tr_class_value = "" + (null_to_empty(/*fav*/ ctx[11].Id === /*id*/ ctx[0] ? 'active' : '') + " svelte-35vezv"));
    		},
    		m(target, anchor) {
    			insert(target, tr, anchor);
    			append(tr, td0);
    			append(td0, t0);
    			append(tr, t1);
    			append(tr, td1);
    			append(td1, span0);
    			append(td1, t2);
    			append(td1, span1);
    			append(tr, t3);

    			if (!mounted) {
    				dispose = [
    					listen(td0, "click", /*loadFavorite*/ ctx[8]),
    					listen(span0, "click", /*editFavorite*/ ctx[6]),
    					listen(span1, "click", /*removeFav*/ ctx[7])
    				];

    				mounted = true;
    			}
    		},
    		p(ctx, dirty) {
    			if (dirty & /*$FavoritesStores*/ 8 && t0_value !== (t0_value = /*fav*/ ctx[11].Name + "")) set_data(t0, t0_value);

    			if (dirty & /*$FavoritesStores*/ 8 && td0_data_title_value !== (td0_data_title_value = /*fav*/ ctx[11].Name)) {
    				attr(td0, "data-title", td0_data_title_value);
    			}

    			if (dirty & /*$FavoritesStores*/ 8 && tr_id_value !== (tr_id_value = /*fav*/ ctx[11].Id)) {
    				attr(tr, "id", tr_id_value);
    			}

    			if (dirty & /*$FavoritesStores, id*/ 9 && tr_class_value !== (tr_class_value = "" + (null_to_empty(/*fav*/ ctx[11].Id === /*id*/ ctx[0] ? 'active' : '') + " svelte-35vezv"))) {
    				attr(tr, "class", tr_class_value);
    			}
    		},
    		d(detaching) {
    			if (detaching) detach(tr);
    			mounted = false;
    			run_all(dispose);
    		}
    	};
    }

    function create_fragment$b(ctx) {
    	let div8;
    	let label0;
    	let t0;
    	let input0;
    	let t1;
    	let div7;
    	let div4;
    	let div2;
    	let div1;
    	let label1;
    	let t2;
    	let div0;
    	let input1;
    	let t3;
    	let span;
    	let t4;
    	let div3;
    	let t5;
    	let div5;
    	let t6_value = (/*error*/ ctx[2] || '') + "";
    	let t6;
    	let t7;
    	let div6;
    	let table;
    	let thead;
    	let t11;
    	let tbody;
    	let mounted;
    	let dispose;
    	let each_value = /*$FavoritesStores*/ ctx[3];
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$2(get_each_context$2(ctx, each_value, i));
    	}

    	return {
    		c() {
    			div8 = element("div");
    			label0 = element("label");
    			label0.innerHTML = `<i class="fas fa-heart svelte-35vezv"></i>`;
    			t0 = space();
    			input0 = element("input");
    			t1 = space();
    			div7 = element("div");
    			div4 = element("div");
    			div2 = element("div");
    			div1 = element("div");
    			label1 = element("label");
    			label1.innerHTML = `<i class="fas fa-save svelte-35vezv"></i>`;
    			t2 = space();
    			div0 = element("div");
    			input1 = element("input");
    			t3 = space();
    			span = element("span");
    			span.innerHTML = `<i class="fas fa-times-circle svelte-35vezv"></i>`;
    			t4 = space();
    			div3 = element("div");
    			t5 = space();
    			div5 = element("div");
    			t6 = text(t6_value);
    			t7 = space();
    			div6 = element("div");
    			table = element("table");
    			thead = element("thead");

    			thead.innerHTML = `<tr class="svelte-35vezv"><th class="svelte-35vezv">Name</th> 
                        <th class="svelte-35vezv">Action</th></tr>`;

    			t11 = space();
    			tbody = element("tbody");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr(label0, "for", "show-favs");
    			attr(input0, "type", "checkbox");
    			attr(input0, "id", "show-favs");
    			attr(input0, "class", "svelte-35vezv");
    			attr(label1, "for", "fav-name");
    			attr(label1, "id", "addfav");
    			attr(label1, "class", "input-group-text");
    			attr(input1, "name", "fav-name");
    			attr(input1, "type", "text");
    			attr(input1, "class", "form-control svelte-35vezv");
    			attr(input1, "placeholder", "New Favorite");
    			attr(span, "class", "svelte-35vezv");
    			attr(div0, "class", "i-control svelte-35vezv");
    			attr(div1, "class", "input-group-prepend");
    			attr(div2, "id", "fav-controls");
    			attr(div3, "class", "text-danger");
    			attr(div4, "class", "modal-title svelte-35vezv");
    			attr(div5, "class", "errors svelte-35vezv");
    			attr(tbody, "class", "svelte-35vezv");
    			attr(table, "class", "table table-bordered bg-light table-hover svelte-35vezv");
    			attr(div6, "class", "modal-body");
    			attr(div7, "id", "fav-manager");
    			attr(div7, "class", "card text-light svelte-35vezv");
    			attr(div8, "class", "first-controls svelte-35vezv");
    		},
    		m(target, anchor) {
    			insert(target, div8, anchor);
    			append(div8, label0);
    			append(div8, t0);
    			append(div8, input0);
    			append(div8, t1);
    			append(div8, div7);
    			append(div7, div4);
    			append(div4, div2);
    			append(div2, div1);
    			append(div1, label1);
    			append(div1, t2);
    			append(div1, div0);
    			append(div0, input1);
    			set_input_value(input1, /*currentFav*/ ctx[1].Name);
    			append(div0, t3);
    			append(div0, span);
    			append(div4, t4);
    			append(div4, div3);
    			append(div7, t5);
    			append(div7, div5);
    			append(div5, t6);
    			append(div7, t7);
    			append(div7, div6);
    			append(div6, table);
    			append(table, thead);
    			append(table, t11);
    			append(table, tbody);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(tbody, null);
    			}

    			if (!mounted) {
    				dispose = [
    					listen(label1, "click", /*saveFavorite*/ ctx[4]),
    					listen(input1, "input", /*input1_input_handler*/ ctx[9]),
    					listen(span, "click", /*clearFavorite*/ ctx[5])
    				];

    				mounted = true;
    			}
    		},
    		p(ctx, [dirty]) {
    			if (dirty & /*currentFav*/ 2 && input1.value !== /*currentFav*/ ctx[1].Name) {
    				set_input_value(input1, /*currentFav*/ ctx[1].Name);
    			}

    			if (dirty & /*error*/ 4 && t6_value !== (t6_value = (/*error*/ ctx[2] || '') + "")) set_data(t6, t6_value);

    			if (dirty & /*$FavoritesStores, id, removeFav, editFavorite, loadFavorite*/ 457) {
    				each_value = /*$FavoritesStores*/ ctx[3];
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$2(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block$2(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(tbody, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}
    		},
    		i: noop,
    		o: noop,
    		d(detaching) {
    			if (detaching) detach(div8);
    			destroy_each(each_blocks, detaching);
    			mounted = false;
    			run_all(dispose);
    		}
    	};
    }

    function instance$b($$self, $$props, $$invalidate) {
    	let $FavoritesStores;
    	component_subscribe($$self, FavoritesStores, $$value => $$invalidate(3, $FavoritesStores = $$value));
    	let { id = "" } = $$props;
    	let currentFav = {};
    	let error;

    	const saveFavorite = event => {
    		currentFav.Type == "";

    		addUpdateFavorite(currentFav).then(result => {
    			if (result.Id !== id) {
    				navigate(`/favorites/${result.Id}`);
    				console.log("navegate", result.Id);
    			}
    		});

    		$$invalidate(2, error = "");
    	};

    	const clearFavorite = () => {
    		$$invalidate(1, currentFav = { Name: "", Type: "Manga" });
    		$$invalidate(2, error = "");
    	};

    	const editFavorite = e => {
    		$$invalidate(1, currentFav = $FavoritesStores.find(f => f.Id === e.target.closest("tr").id));
    		$$invalidate(2, error = "");
    	};

    	const removeFav = e => {
    		let tr = e.target.closest("tr");
    		let type = tr.querySelector("td:nth-child(2)").textContent;

    		// Clear input delete is currentFav
    		removeFavorite(tr.id, type).then(data => {
    			//Navegate to first favorite
    			if (data.removed) {
    				navigate(`/favorites/${$FavoritesStores[0].Id}`);
    			} else {
    				$$invalidate(2, error = data.msg);
    			}
    		});
    	};

    	const loadFavorite = event => {
    		navigate(`/favorites/${event.target.closest("tr").id}`);
    		$$invalidate(2, error = "");
    	};

    	function input1_input_handler() {
    		currentFav.Name = this.value;
    		($$invalidate(1, currentFav), $$invalidate(0, id));
    	}

    	$$self.$$set = $$props => {
    		if ('id' in $$props) $$invalidate(0, id = $$props.id);
    	};

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*id*/ 1) {
    			($$invalidate(1, currentFav = { Name: "", Type: "Manga" }));
    		}
    	};

    	return [
    		id,
    		currentFav,
    		error,
    		$FavoritesStores,
    		saveFavorite,
    		clearFavorite,
    		editFavorite,
    		removeFav,
    		loadFavorite,
    		input1_input_handler
    	];
    }

    class FavoriteManager extends SvelteComponent {
    	constructor(options) {
    		super();
    		init(this, options, instance$b, create_fragment$b, safe_not_equal, { id: 0 });
    	}
    }

    /* src\User\pages\Favorites.svelte generated by Svelte v3.49.0 */

    function create_default_slot$3(ctx) {
    	let favoritemanager;
    	let current;
    	favoritemanager = new FavoriteManager({ props: { id: /*id*/ ctx[2] } });

    	return {
    		c() {
    			create_component(favoritemanager.$$.fragment);
    		},
    		m(target, anchor) {
    			mount_component(favoritemanager, target, anchor);
    			current = true;
    		},
    		p(ctx, dirty) {
    			const favoritemanager_changes = {};
    			if (dirty & /*id*/ 4) favoritemanager_changes.id = /*id*/ ctx[2];
    			favoritemanager.$set(favoritemanager_changes);
    		},
    		i(local) {
    			if (current) return;
    			transition_in(favoritemanager.$$.fragment, local);
    			current = true;
    		},
    		o(local) {
    			transition_out(favoritemanager.$$.fragment, local);
    			current = false;
    		},
    		d(detaching) {
    			destroy_component(favoritemanager, detaching);
    		}
    	};
    }

    function create_fragment$a(ctx) {
    	let fileslist;
    	let current;

    	fileslist = new FilesList({
    			props: {
    				title: "Favorites",
    				type: /*type*/ ctx[3],
    				filter: /*filter*/ ctx[1],
    				page: /*page*/ ctx[0],
    				id: /*id*/ ctx[2],
    				$$slots: { default: [create_default_slot$3] },
    				$$scope: { ctx }
    			}
    		});

    	return {
    		c() {
    			create_component(fileslist.$$.fragment);
    		},
    		m(target, anchor) {
    			mount_component(fileslist, target, anchor);
    			current = true;
    		},
    		p(ctx, [dirty]) {
    			const fileslist_changes = {};
    			if (dirty & /*type*/ 8) fileslist_changes.type = /*type*/ ctx[3];
    			if (dirty & /*filter*/ 2) fileslist_changes.filter = /*filter*/ ctx[1];
    			if (dirty & /*page*/ 1) fileslist_changes.page = /*page*/ ctx[0];
    			if (dirty & /*id*/ 4) fileslist_changes.id = /*id*/ ctx[2];

    			if (dirty & /*$$scope, id*/ 260) {
    				fileslist_changes.$$scope = { dirty, ctx };
    			}

    			fileslist.$set(fileslist_changes);
    		},
    		i(local) {
    			if (current) return;
    			transition_in(fileslist.$$.fragment, local);
    			current = true;
    		},
    		o(local) {
    			transition_out(fileslist.$$.fragment, local);
    			current = false;
    		},
    		d(detaching) {
    			destroy_component(fileslist, detaching);
    		}
    	};
    }

    function instance$a($$self, $$props, $$invalidate) {
    	let $FavoritesStores;
    	component_subscribe($$self, FavoritesStores, $$value => $$invalidate(4, $FavoritesStores = $$value));
    	let { page = 1 } = $$props;
    	let { filter = "" } = $$props;
    	let { id = $FavoritesStores[0].Id } = $$props;
    	getContext("User");
    	let type = `favorites/${id}`;

    	$$self.$$set = $$props => {
    		if ('page' in $$props) $$invalidate(0, page = $$props.page);
    		if ('filter' in $$props) $$invalidate(1, filter = $$props.filter);
    		if ('id' in $$props) $$invalidate(2, id = $$props.id);
    	};

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*id*/ 4) {
    			$$invalidate(3, type = `favorites/${id}`);
    		}
    	};

    	return [page, filter, id, type];
    }

    class Favorites extends SvelteComponent {
    	constructor(options) {
    		super();
    		init(this, options, instance$a, create_fragment$a, safe_not_equal, { page: 0, filter: 1, id: 2 });
    	}
    }

    /* src\User\pages\Content.svelte generated by Svelte v3.49.0 */

    function create_default_slot$2(ctx) {
    	let div;
    	let mounted;
    	let dispose;

    	return {
    		c() {
    			div = element("div");
    			div.innerHTML = `<i class="fas fa-arrow-circle-up svelte-1h1xnzm"></i>`;
    			attr(div, "class", "first-controls svelte-1h1xnzm");
    		},
    		m(target, anchor) {
    			insert(target, div, anchor);

    			if (!mounted) {
    				dispose = listen(div, "click", /*exitFolder*/ ctx[4]);
    				mounted = true;
    			}
    		},
    		p: noop,
    		d(detaching) {
    			if (detaching) detach(div);
    			mounted = false;
    			dispose();
    		}
    	};
    }

    function create_fragment$9(ctx) {
    	let fileslist;
    	let current;

    	fileslist = new FilesList({
    			props: {
    				title: "Content",
    				type: /*type*/ ctx[3],
    				filter: /*filter*/ ctx[1],
    				page: /*page*/ ctx[0],
    				id: /*id*/ ctx[2],
    				$$slots: { default: [create_default_slot$2] },
    				$$scope: { ctx }
    			}
    		});

    	return {
    		c() {
    			create_component(fileslist.$$.fragment);
    		},
    		m(target, anchor) {
    			mount_component(fileslist, target, anchor);
    			current = true;
    		},
    		p(ctx, [dirty]) {
    			const fileslist_changes = {};
    			if (dirty & /*filter*/ 2) fileslist_changes.filter = /*filter*/ ctx[1];
    			if (dirty & /*page*/ 1) fileslist_changes.page = /*page*/ ctx[0];
    			if (dirty & /*id*/ 4) fileslist_changes.id = /*id*/ ctx[2];

    			if (dirty & /*$$scope*/ 64) {
    				fileslist_changes.$$scope = { dirty, ctx };
    			}

    			fileslist.$set(fileslist_changes);
    		},
    		i(local) {
    			if (current) return;
    			transition_in(fileslist.$$.fragment, local);
    			current = true;
    		},
    		o(local) {
    			transition_out(fileslist.$$.fragment, local);
    			current = false;
    		},
    		d(detaching) {
    			destroy_component(fileslist, detaching);
    		}
    	};
    }

    function instance$9($$self, $$props, $$invalidate) {
    	let { page = 1 } = $$props;
    	let { filter = "" } = $$props;
    	let { id = "" } = $$props;
    	let segment = window.location.pathname.replace(/(^\/+|\/+$)/g, "").split("/");
    	let type = `${segment[0]}/${segment[1]}/${id}`;

    	const exitFolder = () => {
    		let folder = localStorage.getObject("folder");
    		localStorage.setItem("fileId", folder.folder);
    		navigate(folder.pathname, { replace: true });
    	};

    	$$self.$$set = $$props => {
    		if ('page' in $$props) $$invalidate(0, page = $$props.page);
    		if ('filter' in $$props) $$invalidate(1, filter = $$props.filter);
    		if ('id' in $$props) $$invalidate(2, id = $$props.id);
    	};

    	return [page, filter, id, type, exitFolder];
    }

    class Content extends SvelteComponent {
    	constructor(options) {
    		super();
    		init(this, options, instance$9, create_fragment$9, safe_not_equal, { page: 0, filter: 1, id: 2 });
    	}
    }

    /* src\User\Component\PlayList.svelte generated by Svelte v3.49.0 */

    function get_each_context$1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[20] = list[i].Id;
    	child_ctx[21] = list[i].Name;
    	child_ctx[22] = list[i].Cover;
    	child_ctx[23] = list[i].CurrentPos;
    	child_ctx[24] = list[i].Duration;
    	child_ctx[25] = list[i].Type;
    	return child_ctx;
    }

    // (131:6) {#each filtered.slice(toLoad, toLoad + filePerPage) as { Id, Name, Cover, CurrentPos, Duration, Type }}
    function create_each_block$1(ctx) {
    	let li;
    	let span1;
    	let img;
    	let img_data_src_value;
    	let img_src_value;
    	let t0;
    	let span0;

    	let t1_value = (/*Type*/ ctx[25].includes("Manga")
    	? `${/*CurrentPos*/ ctx[23] + 1}/${/*Duration*/ ctx[24]}`
    	: formatTime(/*Duration*/ ctx[24])) + "";

    	let t1;
    	let t2;
    	let span2;
    	let t3_value = /*Name*/ ctx[21] + "";
    	let t3;
    	let t4;
    	let li_id_value;
    	let li_class_value;
    	let mounted;
    	let dispose;

    	return {
    		c() {
    			li = element("li");
    			span1 = element("span");
    			img = element("img");
    			t0 = space();
    			span0 = element("span");
    			t1 = text(t1_value);
    			t2 = space();
    			span2 = element("span");
    			t3 = text(t3_value);
    			t4 = space();
    			attr(img, "data-src", img_data_src_value = /*Cover*/ ctx[22]);
    			if (!src_url_equal(img.src, img_src_value = "")) attr(img, "src", img_src_value);
    			attr(img, "alt", "");
    			attr(img, "class", "svelte-bfixg2");
    			attr(span0, "class", "duration svelte-bfixg2");
    			attr(span1, "class", "cover svelte-bfixg2");
    			attr(span2, "class", "l-name svelte-bfixg2");
    			attr(li, "id", li_id_value = /*Id*/ ctx[20]);
    			attr(li, "class", li_class_value = "" + (null_to_empty(/*Id*/ ctx[20] === /*fileId*/ ctx[1] ? "active" : "") + " svelte-bfixg2"));
    		},
    		m(target, anchor) {
    			insert(target, li, anchor);
    			append(li, span1);
    			append(span1, img);
    			append(span1, t0);
    			append(span1, span0);
    			append(span0, t1);
    			append(li, t2);
    			append(li, span2);
    			append(span2, t3);
    			append(li, t4);

    			if (!mounted) {
    				dispose = listen(li, "click", /*click_handler*/ ctx[12]);
    				mounted = true;
    			}
    		},
    		p(ctx, dirty) {
    			if (dirty & /*filtered, toLoad*/ 192 && img_data_src_value !== (img_data_src_value = /*Cover*/ ctx[22])) {
    				attr(img, "data-src", img_data_src_value);
    			}

    			if (dirty & /*filtered, toLoad*/ 192 && t1_value !== (t1_value = (/*Type*/ ctx[25].includes("Manga")
    			? `${/*CurrentPos*/ ctx[23] + 1}/${/*Duration*/ ctx[24]}`
    			: formatTime(/*Duration*/ ctx[24])) + "")) set_data(t1, t1_value);

    			if (dirty & /*filtered, toLoad*/ 192 && t3_value !== (t3_value = /*Name*/ ctx[21] + "")) set_data(t3, t3_value);

    			if (dirty & /*filtered, toLoad*/ 192 && li_id_value !== (li_id_value = /*Id*/ ctx[20])) {
    				attr(li, "id", li_id_value);
    			}

    			if (dirty & /*filtered, toLoad, fileId*/ 194 && li_class_value !== (li_class_value = "" + (null_to_empty(/*Id*/ ctx[20] === /*fileId*/ ctx[1] ? "active" : "") + " svelte-bfixg2"))) {
    				attr(li, "class", li_class_value);
    			}
    		},
    		d(detaching) {
    			if (detaching) detach(li);
    			mounted = false;
    			dispose();
    		}
    	};
    }

    // (144:2) {#if totalPages > 1}
    function create_if_block$5(ctx) {
    	let div;
    	let pagination;
    	let current;

    	pagination = new Pagination({
    			props: {
    				page: parseInt(/*page*/ ctx[5] || 1),
    				totalPages: /*totalPages*/ ctx[4],
    				hideFL: true
    			}
    		});

    	pagination.$on("gotopage", /*goToPage*/ ctx[9]);

    	return {
    		c() {
    			div = element("div");
    			create_component(pagination.$$.fragment);
    			attr(div, "class", "b-control svelte-bfixg2");
    		},
    		m(target, anchor) {
    			insert(target, div, anchor);
    			mount_component(pagination, div, null);
    			current = true;
    		},
    		p(ctx, dirty) {
    			const pagination_changes = {};
    			if (dirty & /*page*/ 32) pagination_changes.page = parseInt(/*page*/ ctx[5] || 1);
    			if (dirty & /*totalPages*/ 16) pagination_changes.totalPages = /*totalPages*/ ctx[4];
    			pagination.$set(pagination_changes);
    		},
    		i(local) {
    			if (current) return;
    			transition_in(pagination.$$.fragment, local);
    			current = true;
    		},
    		o(local) {
    			transition_out(pagination.$$.fragment, local);
    			current = false;
    		},
    		d(detaching) {
    			if (detaching) detach(div);
    			destroy_component(pagination);
    		}
    	};
    }

    function create_fragment$8(ctx) {
    	let label;
    	let span0;
    	let label_class_value;
    	let t0;
    	let input0;
    	let t1;
    	let div2;
    	let div0;
    	let input1;
    	let t2;
    	let span1;
    	let t3;
    	let div1;
    	let ul;
    	let t4;
    	let current;
    	let mounted;
    	let dispose;
    	let each_value = /*filtered*/ ctx[6].slice(/*toLoad*/ ctx[7], /*toLoad*/ ctx[7] + filePerPage);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$1(get_each_context$1(ctx, each_value, i));
    	}

    	let if_block = /*totalPages*/ ctx[4] > 1 && create_if_block$5(ctx);

    	return {
    		c() {
    			label = element("label");
    			span0 = element("span");
    			span0.innerHTML = `<i class="fas fa-list svelte-bfixg2"></i>`;
    			t0 = space();
    			input0 = element("input");
    			t1 = space();
    			div2 = element("div");
    			div0 = element("div");
    			input1 = element("input");
    			t2 = space();
    			span1 = element("span");
    			span1.innerHTML = `<i class="fas fa-times-circle svelte-bfixg2"></i>`;
    			t3 = space();
    			div1 = element("div");
    			ul = element("ul");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t4 = space();
    			if (if_block) if_block.c();
    			attr(span0, "class", "p-sort svelte-bfixg2");
    			attr(label, "class", label_class_value = "" + (null_to_empty("show-list" + (!/*hideList*/ ctx[3] ? " move" : "")) + " svelte-bfixg2"));
    			attr(label, "for", "p-hide");
    			set_style(label, "bottom", "35px");
    			attr(input0, "type", "checkbox");
    			attr(input0, "id", "p-hide");
    			attr(input0, "class", "svelte-bfixg2");
    			attr(input1, "type", "text");
    			attr(input1, "placeholder", "Filter");
    			attr(input1, "class", "form-control svelte-bfixg2");
    			attr(span1, "class", "clear-filter svelte-bfixg2");
    			attr(div0, "id", "v-filter");
    			attr(div0, "class", "svelte-bfixg2");
    			attr(ul, "class", "svelte-bfixg2");
    			attr(div1, "id", "p-list");
    			attr(div1, "class", "svelte-bfixg2");
    			attr(div2, "id", "play-list");
    			attr(div2, "class", "svelte-bfixg2");
    			toggle_class(div2, "move", !/*$ToggleMenu*/ ctx[8]);
    		},
    		m(target, anchor) {
    			insert(target, label, anchor);
    			append(label, span0);
    			insert(target, t0, anchor);
    			insert(target, input0, anchor);
    			input0.checked = /*hideList*/ ctx[3];
    			insert(target, t1, anchor);
    			insert(target, div2, anchor);
    			append(div2, div0);
    			append(div0, input1);
    			set_input_value(input1, /*filters*/ ctx[0].filter);
    			append(div0, t2);
    			append(div0, span1);
    			append(div2, t3);
    			append(div2, div1);
    			append(div1, ul);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(ul, null);
    			}

    			/*div1_binding*/ ctx[15](div1);
    			append(div2, t4);
    			if (if_block) if_block.m(div2, null);
    			current = true;

    			if (!mounted) {
    				dispose = [
    					listen(input0, "change", /*input0_change_handler*/ ctx[13]),
    					listen(input1, "input", /*input1_input_handler*/ ctx[14]),
    					listen(span1, "click", /*clearFilter*/ ctx[10])
    				];

    				mounted = true;
    			}
    		},
    		p(ctx, [dirty]) {
    			if (!current || dirty & /*hideList*/ 8 && label_class_value !== (label_class_value = "" + (null_to_empty("show-list" + (!/*hideList*/ ctx[3] ? " move" : "")) + " svelte-bfixg2"))) {
    				attr(label, "class", label_class_value);
    			}

    			if (dirty & /*hideList*/ 8) {
    				input0.checked = /*hideList*/ ctx[3];
    			}

    			if (dirty & /*filters*/ 1 && input1.value !== /*filters*/ ctx[0].filter) {
    				set_input_value(input1, /*filters*/ ctx[0].filter);
    			}

    			if (dirty & /*filtered, toLoad, filePerPage, fileId, formatTime*/ 194) {
    				each_value = /*filtered*/ ctx[6].slice(/*toLoad*/ ctx[7], /*toLoad*/ ctx[7] + filePerPage);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$1(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block$1(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(ul, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}

    			if (/*totalPages*/ ctx[4] > 1) {
    				if (if_block) {
    					if_block.p(ctx, dirty);

    					if (dirty & /*totalPages*/ 16) {
    						transition_in(if_block, 1);
    					}
    				} else {
    					if_block = create_if_block$5(ctx);
    					if_block.c();
    					transition_in(if_block, 1);
    					if_block.m(div2, null);
    				}
    			} else if (if_block) {
    				group_outros();

    				transition_out(if_block, 1, 1, () => {
    					if_block = null;
    				});

    				check_outros();
    			}

    			if (dirty & /*$ToggleMenu*/ 256) {
    				toggle_class(div2, "move", !/*$ToggleMenu*/ ctx[8]);
    			}
    		},
    		i(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d(detaching) {
    			if (detaching) detach(label);
    			if (detaching) detach(t0);
    			if (detaching) detach(input0);
    			if (detaching) detach(t1);
    			if (detaching) detach(div2);
    			destroy_each(each_blocks, detaching);
    			/*div1_binding*/ ctx[15](null);
    			if (if_block) if_block.d();
    			mounted = false;
    			run_all(dispose);
    		}
    	};
    }

    const filePerPage = 100;

    function instance$8($$self, $$props, $$invalidate) {
    	let $ToggleMenu;
    	component_subscribe($$self, ToggleMenu, $$value => $$invalidate(8, $ToggleMenu = $$value));
    	const dispatch = createEventDispatcher();
    	let { files = [] } = $$props;
    	let { fileId } = $$props;
    	let { filters = { filter: "" } } = $$props;
    	let observer;
    	let playList;
    	let hideList = true;
    	let totalPages = 0;
    	let page = 1;
    	let toLoad = 0;
    	let filtered = [];

    	const getPage = () => {
    		let i = filtered.findIndex(f => f.Id === fileId);
    		let pg = 1;
    		while (pg * filePerPage < i && pg < totalPages) pg++;
    		return pg;
    	};

    	const setObserver = () => {
    		if (observer) {
    			observer.disconnect();
    		}

    		if (playList) {
    			let imgs = document.querySelectorAll("#play-list li img");

    			observer = new IntersectionObserver(entries => {
    					for (let entry of entries) {
    						let img = entry.target;

    						if (entry.isIntersecting) {
    							img.src = img.dataset.src;
    						} else {
    							img.src = "";
    						}
    					}
    				},
    			{
    					root: playList,
    					rootMargin: "1000px",
    					threshold: 0
    				});

    			imgs.forEach(lazyImg => {
    				observer.observe(lazyImg);
    			});
    		}
    	};

    	const goToPage = pg => {
    		pg = parseInt(pg.detail);
    		if (pg < 1 || pg > totalPages || isNaN(pg)) return;
    		$$invalidate(5, page = pg < 1 ? 1 : pg > totalPages ? totalPages : pg);
    		setObserver();
    	};

    	const clearFilter = () => {
    		console.log("dispath-clear");
    		$$invalidate(0, filters.filter = "", filters);
    		dispatch("clearfilter");
    	};

    	function click_handler(event) {
    		bubble.call(this, $$self, event);
    	}

    	function input0_change_handler() {
    		hideList = this.checked;
    		$$invalidate(3, hideList);
    	}

    	function input1_input_handler() {
    		filters.filter = this.value;
    		$$invalidate(0, filters);
    	}

    	function div1_binding($$value) {
    		binding_callbacks[$$value ? 'unshift' : 'push'](() => {
    			playList = $$value;
    			$$invalidate(2, playList);
    		});
    	}

    	$$self.$$set = $$props => {
    		if ('files' in $$props) $$invalidate(11, files = $$props.files);
    		if ('fileId' in $$props) $$invalidate(1, fileId = $$props.fileId);
    		if ('filters' in $$props) $$invalidate(0, filters = $$props.filters);
    	};

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*hideList, playList*/ 12) {
    			if (!hideList) {
    				if (playList) {
    					let current = document.querySelector("#play-list .active");

    					if (current) {
    						playList.scroll({ top: current.offsetTop - 250 });
    						setObserver();

    						setTimeout(
    							() => {
    								playList.scroll({ top: current.offsetTop - 250 });
    							},
    							300
    						);
    					}
    				}
    			}
    		}

    		if ($$self.$$.dirty & /*filters, files*/ 2049) {
    			{
    				if (filters.filter) {
    					$$invalidate(6, filtered = files.filter(f => f.Name.toLocaleLowerCase().includes(filters.filter.toLocaleLowerCase())));
    				} else {
    					$$invalidate(6, filtered = files);
    				}

    				const tout = setTimeout(
    					() => {
    						setObserver();
    						clearTimeout(tout);
    					},
    					50
    				);
    			}
    		}

    		if ($$self.$$.dirty & /*files, totalPages, filtered*/ 2128) {
    			if (files.length > 100 && totalPages === 0) {
    				$$invalidate(4, totalPages = Math.ceil(filtered.length / filePerPage));
    				$$invalidate(5, page = getPage());
    			}
    		}

    		if ($$self.$$.dirty & /*page, filtered*/ 96) {
    			{
    				let start = (page - 1) * filePerPage;

    				if (start < filtered.length) {
    					$$invalidate(7, toLoad = start);
    				} else {
    					$$invalidate(7, toLoad = 0);
    				}
    			}
    		}
    	};

    	return [
    		filters,
    		fileId,
    		playList,
    		hideList,
    		totalPages,
    		page,
    		filtered,
    		toLoad,
    		$ToggleMenu,
    		goToPage,
    		clearFilter,
    		files,
    		click_handler,
    		input0_change_handler,
    		input1_input_handler,
    		div1_binding
    	];
    }

    class PlayList extends SvelteComponent {
    	constructor(options) {
    		super();
    		init(this, options, instance$8, create_fragment$8, safe_not_equal, { files: 11, fileId: 1, filters: 0 });
    	}
    }

    var pageObserver;
    var imgObserver;
    let imgs;
    let currentPage;
    const PageObserver = (setPage, container, loadImages) => {
        imgs = container.querySelectorAll("img");
        if (!pageObserver) {
            pageObserver = new IntersectionObserver(
                (entries) => {
                    if (entries.length < imgs.length) {
                        for (let entry of entries) {
                            let img = entry.target;
                            if (entry.isIntersecting) {
                                setPage(parseInt(img.id));
                                currentPage = img.id;
                                let timg = imgs[currentPage];
                                if (timg && !timg.src.includes("data:img")) {
                                    loadImages(currentPage - 3, 8, 1);
                                }
                            }
                        }
                    }
                },
                { root: container }
            );

            imgs.forEach((lazyImg) => {
                pageObserver.observe(lazyImg);
            });
        }

        return pageObserver;
    };

    let mDown = false;
    const onmousedown = () => {
        mDown = true;
    };

    const onmouseup = () => {
        const curPage = currentPage;
        if (imgs[curPage] && !imgs[curPage].src) {
            loadImages(curPage - 1, 6);
            setTimeout(() => {
                scrollInView(curPage);
                setTimeout(() => {
                    clearTimeout(tout);
                    mDown = false;
                }, 100);
            }, 500);
        } else {
            mDown = false;
        }
    };

    let tout;
    let load = false;
    const scrollImageLoader = (loadImages, container) => {
        container.onmouseup = onmouseup;
        container.onmousedown = onmousedown;

        if (!imgObserver) {
            imgObserver = new IntersectionObserver(
                (entries) => {
                    if (!mDown) {
                        if (entries.length < imgs.length) {
                            let pg, dir;
                            for (let entry of entries) {
                                if (entry.isIntersecting) {
                                    pg = parseInt(entry.target.id);
                                    dir = pg < currentPage ? -1 : 1;

                                    const img = imgs[dir + pg];
                                    if (img && !img.src.includes("data:img")) {
                                        load = true;
                                    }
                                }
                            }
                            if (load) {
                                load = false;
                                if (tout) clearTimeout(tout);
                                tout = setTimeout(() => {
                                    loadImages(pg, 8, dir);
                                    clearTimeout(tout);
                                }, 50);
                            }
                        }
                    }
                },
                {
                    root: container,
                    rootMargin: window.innerHeight * 2 + "px",
                    threshold: 0,
                }
            );
        }

        imgs.forEach((lazyImg) => {
            imgObserver.observe(lazyImg);
        });
    };

    const disconnectObvrs = (container) => {
        container.onmousedown = null;
        container.onmouseup = null;
        pageObserver && pageObserver.disconnect();
        imgObserver && imgObserver.disconnect();
        imgs = [];
        pageObserver = null;
        imgObserver = null;
        imgs = null;
        currentPage = null;
    };

    var lastEl = null;
    const setfullscreen = (element) => {
        try {
            if (lastEl && element.tagName !== "BODY") {
                if (document.fullscreenElement.tagName === "BODY") {
                    document.exitFullscreen().then(() => {
                        element.requestFullscreen();
                    });
                } else {
                    document.exitFullscreen().then(() => {
                        lastEl.requestFullscreen();
                    });
                }
            } else {
                if (!document.fullscreenElement) {
                    element.requestFullscreen();
                    if (element.tagName === "BODY") lastEl = element;
                } else {
                    document.exitFullscreen();
                    lastEl = null;
                }
            }
        } catch (err) {
            console.log(err);
        }
    };

    const KeyMap = {
        PrevFile: {
            name: "Ins",
            keyCode: 45,
            isctrl: true,
            action: null,
        },
        NextFile: {
            name: "Del",
            keyCode: 46,
            isctrl: true,
            action: null,
        },
        SkipForward: {
            name: "ArrowRight",
            keyCode: 39,
            isctrl: false,
            action: null,
        },
        SkipBack: {
            name: "ArrowLeft",
            keyCode: 37,
            isctrl: false,
            action: null,
        },
        Fullscreen: {
            name: "Enter",
            keyCode: 13,
            isctrl: false,
            action: null,
        },
        VolumeUp: {
            name: "ArrowUp",
            keyCode: 38,
            isctrl: false,
            action: null,
        },
        VolumeDown: {
            name: "ArrowDown",
            keyCode: 40,
            isctrl: false,
            action: null,
        },
        PlayOrPause: {
            name: "Space",
            keyCode: 32,
            isctrl: false,
            action: null,
        },
        ShowList: {
            name: "L",
            keyCode: 30,
            isctrl: false,
            action: null,
        },
    };

    const handleKeyboard = (e) => {
        for (let key of Object.keys(KeyMap)) {
            if (KeyMap[key].keyCode === e.keyCode) {
                let { action, isctrl } = KeyMap[key];
                if (action && e.ctrlKey === isctrl) action(e.ctrlKey);
                break;
            }
        }
    };

    let tStart, tEnd;
    let point = {};
    let touching$1 = false;
    let drag = false;
    let moveY = { dis: 0, dir: 0 };
    let moveX = { dis: 0, dir: 0 };

    let controls = { nextPage: "", prevPage: "", nextFile: "", prevFile: "" };
    const onTouchStart = (e) => {
        touching$1 = true;
        tStart = e.timeStamp;
        let { pageX, pageY } = (e.touches && e.touches[0]) || e;
        point = { x: pageX, y: pageY };
    };

    const onTouchMove = (e) => {
        if (touching$1) {
            let { pageX, pageY } = e.touches[0];
            moveX.dir = pageX - point.x;
            moveY.dir = pageY - point.y;
            moveY.dis = Math.abs(moveY.dir);
            moveX.dis = Math.abs(moveX.dir);
            drag = true;
        }
    };

    const onTouchEnd = (e) => {
        touching$1 = false;
        let {
            file: { CurrentPos, Duration },
            webtoon,
            nextFile,
            nextPage,
            prevFile,
            prevPage,
            fullScreen,
        } = controls;
        if (!drag) {
            tEnd = e.timeStamp;
            let elapsed = tEnd - tStart;
            if (elapsed > 70) {
                let ww = window.innerWidth;
                let wh = window.innerHeight;
                if (point.y < wh * 0.33) {
                    if (point.x < ww * 0.33) {
                        console.log("left Y25%");
                    } else if (point.x < ww * 0.66) {
                        // center
                        console.log("center Y25%");
                    } else {
                        // right
                        console.log("right Y25%");
                    }
                } else if (point.y < wh * 0.8) {
                    if (point.x < ww * 0.33) {
                        console.log("left Y50%");
                        nextPage();
                    } else if (point.x < ww * 0.66) {
                        fullScreen();
                        console.log("center Y50%");
                    } else {
                        // right
                        console.log("right Y50%");
                        nextPage();
                    }
                    // 25% from the bottom
                } else {
                    if (point.x < ww * 0.33) {
                        //left
                        prevFile();
                    } else if (point.x < ww * 0.66) {
                        // center
                        updateToggleMenu();
                        console.log("center x");
                    } else {
                        // right
                        nextFile();
                        console.log("right x");
                    }
                }
            }
        } else {
            if (moveX.dis > 100) {
                if (moveX.dir > 0) {
                    prevPage();
                } else {
                    nextPage();
                }
            } else if (moveY.dis > 180) {
                if (moveY.dir > 0) {
                    console.log("down");
                    if (webtoon && CurrentPos === 0) {
                        prevFile();
                    }
                } else {
                    console.log("up");

                    console.log(webtoon, CurrentPos, Duration - 1);
                    if (webtoon && CurrentPos === Duration - 1) {
                        nextFile();
                    }
                }
            }
        }
        drag = false;
    };

    /* src\User\Component\MangaConfig.svelte generated by Svelte v3.49.0 */

    function create_fragment$7(ctx) {
    	let label0;
    	let t0;
    	let input0;
    	let t1;
    	let div6;
    	let div1;
    	let div0;
    	let t3;
    	let select;
    	let option0;
    	let option1;
    	let option2;
    	let t7;
    	let div3;
    	let div2;
    	let t9;
    	let input1;
    	let input1_placeholder_value;
    	let t10;
    	let div5;
    	let div4;
    	let t12;
    	let input2;
    	let mounted;
    	let dispose;

    	return {
    		c() {
    			label0 = element("label");
    			label0.innerHTML = `<i class="fas fa-cog svelte-1frc9ix"></i>`;
    			t0 = space();
    			input0 = element("input");
    			t1 = space();
    			div6 = element("div");
    			div1 = element("div");
    			div0 = element("div");
    			div0.innerHTML = `<label for="img-fill" class="input-group-text svelte-1frc9ix">Ajust Image:</label>`;
    			t3 = space();
    			select = element("select");
    			option0 = element("option");
    			option0.textContent = "fill";
    			option1 = element("option");
    			option1.textContent = "cover";
    			option2 = element("option");
    			option2.textContent = "contain";
    			t7 = space();
    			div3 = element("div");
    			div2 = element("div");
    			div2.innerHTML = `<label for="img-width" class="input-group-text svelte-1frc9ix">Width</label>`;
    			t9 = space();
    			input1 = element("input");
    			t10 = space();
    			div5 = element("div");
    			div4 = element("div");
    			div4.innerHTML = `<label for="from-start" class="input-group-text svelte-1frc9ix">From Start</label>`;
    			t12 = space();
    			input2 = element("input");
    			attr(label0, "for", "show");
    			attr(label0, "class", "svelte-1frc9ix");
    			attr(input0, "type", "checkbox");
    			attr(input0, "name", "");
    			attr(input0, "id", "show");
    			attr(input0, "class", "svelte-1frc9ix");
    			attr(div0, "class", "input-group-prepend svelte-1frc9ix");
    			option0.__value = "fill";
    			option0.value = option0.__value;
    			attr(option0, "class", "svelte-1frc9ix");
    			option1.__value = "cover";
    			option1.value = option1.__value;
    			attr(option1, "class", "svelte-1frc9ix");
    			option2.__value = "contain";
    			option2.value = option2.__value;
    			attr(option2, "class", "svelte-1frc9ix");
    			attr(select, "id", "img-fill");
    			attr(select, "class", "form-control svelte-1frc9ix");
    			if (/*imgAbjust*/ ctx[2] === void 0) add_render_callback(() => /*select_change_handler*/ ctx[14].call(select));
    			attr(div1, "class", "input-group svelte-1frc9ix");
    			attr(div2, "class", "input-group-prepend svelte-1frc9ix");
    			attr(input1, "id", "img-width");
    			attr(input1, "type", "number");
    			attr(input1, "min", "30");
    			attr(input1, "max", "100");
    			attr(input1, "class", "form-control svelte-1frc9ix");
    			attr(input1, "placeholder", input1_placeholder_value = /*config*/ ctx[0].width + '%');
    			attr(div3, "class", "input-group svelte-1frc9ix");
    			attr(div4, "class", "input-group-prepend svelte-1frc9ix");
    			attr(input2, "id", "from-start");
    			attr(input2, "type", "checkbox");
    			attr(input2, "class", "form-control svelte-1frc9ix");
    			attr(div5, "class", "input-group svelte-1frc9ix");
    			attr(div6, "id", "content");
    			attr(div6, "class", "svelte-1frc9ix");
    			toggle_class(div6, "show", /*show*/ ctx[4]);
    		},
    		m(target, anchor) {
    			insert(target, label0, anchor);
    			insert(target, t0, anchor);
    			insert(target, input0, anchor);
    			input0.checked = /*show*/ ctx[4];
    			insert(target, t1, anchor);
    			insert(target, div6, anchor);
    			append(div6, div1);
    			append(div1, div0);
    			append(div1, t3);
    			append(div1, select);
    			append(select, option0);
    			append(select, option1);
    			append(select, option2);
    			select_option(select, /*imgAbjust*/ ctx[2]);
    			append(div6, t7);
    			append(div6, div3);
    			append(div3, div2);
    			append(div3, t9);
    			append(div3, input1);
    			set_input_value(input1, /*width*/ ctx[5]);
    			append(div6, t10);
    			append(div6, div5);
    			append(div5, div4);
    			append(div5, t12);
    			append(div5, input2);
    			input2.checked = /*isFromStart*/ ctx[3];

    			if (!mounted) {
    				dispose = [
    					listen(input0, "change", /*input0_change_handler*/ ctx[13]),
    					listen(select, "change", /*select_change_handler*/ ctx[14]),
    					listen(input1, "blur", /*blur*/ ctx[6]),
    					listen(input1, "focus", /*focus*/ ctx[7]),
    					listen(input1, "change", /*change*/ ctx[8]),
    					listen(input1, "keydown", stop_propagation(/*keydown_handler*/ ctx[12])),
    					listen(input1, "input", /*input1_input_handler*/ ctx[15]),
    					listen(input2, "change", /*input2_change_handler*/ ctx[16]),
    					listen(div6, "click", stop_propagation(prevent_default(/*click_handler*/ ctx[11])))
    				];

    				mounted = true;
    			}
    		},
    		p(ctx, [dirty]) {
    			if (dirty & /*show*/ 16) {
    				input0.checked = /*show*/ ctx[4];
    			}

    			if (dirty & /*imgAbjust*/ 4) {
    				select_option(select, /*imgAbjust*/ ctx[2]);
    			}

    			if (dirty & /*config*/ 1 && input1_placeholder_value !== (input1_placeholder_value = /*config*/ ctx[0].width + '%')) {
    				attr(input1, "placeholder", input1_placeholder_value);
    			}

    			if (dirty & /*width*/ 32 && to_number(input1.value) !== /*width*/ ctx[5]) {
    				set_input_value(input1, /*width*/ ctx[5]);
    			}

    			if (dirty & /*isFromStart*/ 8) {
    				input2.checked = /*isFromStart*/ ctx[3];
    			}

    			if (dirty & /*show*/ 16) {
    				toggle_class(div6, "show", /*show*/ ctx[4]);
    			}
    		},
    		i: noop,
    		o: noop,
    		d(detaching) {
    			if (detaching) detach(label0);
    			if (detaching) detach(t0);
    			if (detaching) detach(input0);
    			if (detaching) detach(t1);
    			if (detaching) detach(div6);
    			mounted = false;
    			run_all(dispose);
    		}
    	};
    }

    function instance$7($$self, $$props, $$invalidate) {
    	let $ToggleMenu,
    		$$unsubscribe_ToggleMenu = noop,
    		$$subscribe_ToggleMenu = () => ($$unsubscribe_ToggleMenu(), $$unsubscribe_ToggleMenu = subscribe(ToggleMenu, $$value => $$invalidate(10, $ToggleMenu = $$value)), ToggleMenu);

    	$$self.$$.on_destroy.push(() => $$unsubscribe_ToggleMenu());
    	const dispatch = createEventDispatcher();
    	let { config = {} } = $$props;
    	let { ToggleMenu } = $$props;
    	$$subscribe_ToggleMenu();
    	let show = false;
    	let width = "";
    	let tWidth = config.width;
    	let imgAbjust = config.imgAbjust || "";
    	let isFromStart = false;

    	const blur = () => {
    		$$invalidate(5, width = "");
    	};

    	const focus = () => {
    		$$invalidate(5, width = config.width);
    	};

    	let change = () => {
    		$$invalidate(9, tWidth = width < 30 ? 30 : width > 100 ? 100 : width);
    		$$invalidate(5, width = tWidth);
    		localStorage.setItem("mWidth", width);
    	};

    	function click_handler(event) {
    		bubble.call(this, $$self, event);
    	}

    	function keydown_handler(event) {
    		bubble.call(this, $$self, event);
    	}

    	function input0_change_handler() {
    		show = this.checked;
    		($$invalidate(4, show), $$invalidate(10, $ToggleMenu));
    	}

    	function select_change_handler() {
    		imgAbjust = select_value(this);
    		$$invalidate(2, imgAbjust);
    	}

    	function input1_input_handler() {
    		width = to_number(this.value);
    		$$invalidate(5, width);
    	}

    	function input2_change_handler() {
    		isFromStart = this.checked;
    		$$invalidate(3, isFromStart);
    	}

    	$$self.$$set = $$props => {
    		if ('config' in $$props) $$invalidate(0, config = $$props.config);
    		if ('ToggleMenu' in $$props) $$subscribe_ToggleMenu($$invalidate(1, ToggleMenu = $$props.ToggleMenu));
    	};

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*isFromStart*/ 8) {
    			{
    				console.log("isF", isFromStart);
    				dispatch("fromStart", isFromStart);
    			}
    		}

    		if ($$self.$$.dirty & /*tWidth, imgAbjust*/ 516) {
    			dispatch("mconfig", { width: tWidth, imgAbjust });
    		}

    		if ($$self.$$.dirty & /*$ToggleMenu*/ 1024) {
    			if ($ToggleMenu) {
    				$$invalidate(4, show = false);
    			}
    		}
    	};

    	return [
    		config,
    		ToggleMenu,
    		imgAbjust,
    		isFromStart,
    		show,
    		width,
    		blur,
    		focus,
    		change,
    		tWidth,
    		$ToggleMenu,
    		click_handler,
    		keydown_handler,
    		input0_change_handler,
    		select_change_handler,
    		input1_input_handler,
    		input2_change_handler
    	];
    }

    class MangaConfig extends SvelteComponent {
    	constructor(options) {
    		super();
    		init(this, options, instance$7, create_fragment$7, safe_not_equal, { config: 0, ToggleMenu: 1 });
    	}
    }

    /* src\User\Component\MangaViewer.svelte generated by Svelte v3.49.0 */

    function get_each_context(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[40] = list[i];
    	child_ctx[42] = i;
    	return child_ctx;
    }

    // (215:6) {:else}
    function create_else_block$1(ctx) {
    	let each_1_anchor;
    	let each_value = Array(/*file*/ ctx[0].Duration).fill();
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block(get_each_context(ctx, each_value, i));
    	}

    	return {
    		c() {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			each_1_anchor = empty$1();
    		},
    		m(target, anchor) {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(target, anchor);
    			}

    			insert(target, each_1_anchor, anchor);
    		},
    		p(ctx, dirty) {
    			if (dirty[0] & /*config, images, file*/ 133) {
    				each_value = Array(/*file*/ ctx[0].Duration).fill();
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(each_1_anchor.parentNode, each_1_anchor);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}
    		},
    		d(detaching) {
    			destroy_each(each_blocks, detaching);
    			if (detaching) detach(each_1_anchor);
    		}
    	};
    }

    // (208:6) {#if !webtoon}
    function create_if_block$4(ctx) {
    	let img;
    	let img_src_value;

    	return {
    		c() {
    			img = element("img");
    			set_style(img, "object-fit", /*config*/ ctx[7].imgAbjust);
    			if (!src_url_equal(img.src, img_src_value = /*images*/ ctx[2][/*file*/ ctx[0].CurrentPos] && "data:img/jpeg;base64, " + /*images*/ ctx[2][/*file*/ ctx[0].CurrentPos])) attr(img, "src", img_src_value);
    			attr(img, "alt", "Loading...");
    			toggle_class(img, "empty-img", !/*images*/ ctx[2][/*file*/ ctx[0].CurrentPos]);
    		},
    		m(target, anchor) {
    			insert(target, img, anchor);
    		},
    		p(ctx, dirty) {
    			if (dirty[0] & /*config*/ 128) {
    				set_style(img, "object-fit", /*config*/ ctx[7].imgAbjust);
    			}

    			if (dirty[0] & /*images, file*/ 5 && !src_url_equal(img.src, img_src_value = /*images*/ ctx[2][/*file*/ ctx[0].CurrentPos] && "data:img/jpeg;base64, " + /*images*/ ctx[2][/*file*/ ctx[0].CurrentPos])) {
    				attr(img, "src", img_src_value);
    			}

    			if (dirty[0] & /*images, file*/ 5) {
    				toggle_class(img, "empty-img", !/*images*/ ctx[2][/*file*/ ctx[0].CurrentPos]);
    			}
    		},
    		d(detaching) {
    			if (detaching) detach(img);
    		}
    	};
    }

    // (216:8) {#each Array(file.Duration).fill() as _, i}
    function create_each_block(ctx) {
    	let img;
    	let img_src_value;

    	return {
    		c() {
    			img = element("img");
    			attr(img, "id", /*i*/ ctx[42]);
    			set_style(img, "object-fit", /*config*/ ctx[7].imgAbjust);

    			if (!src_url_equal(img.src, img_src_value = /*images*/ ctx[2][/*i*/ ctx[42]]
    			? "data:img/jpeg;base64, " + /*images*/ ctx[2][/*i*/ ctx[42]]
    			: "")) attr(img, "src", img_src_value);

    			attr(img, "alt", "Loading...r");
    			attr(img, "class", "svelte-16u82nq");
    			toggle_class(img, "empty-img", !/*images*/ ctx[2][/*i*/ ctx[42]]);
    		},
    		m(target, anchor) {
    			insert(target, img, anchor);
    		},
    		p(ctx, dirty) {
    			if (dirty[0] & /*config*/ 128) {
    				set_style(img, "object-fit", /*config*/ ctx[7].imgAbjust);
    			}

    			if (dirty[0] & /*images*/ 4 && !src_url_equal(img.src, img_src_value = /*images*/ ctx[2][/*i*/ ctx[42]]
    			? "data:img/jpeg;base64, " + /*images*/ ctx[2][/*i*/ ctx[42]]
    			: "")) {
    				attr(img, "src", img_src_value);
    			}

    			if (dirty[0] & /*images*/ 4) {
    				toggle_class(img, "empty-img", !/*images*/ ctx[2][/*i*/ ctx[42]]);
    			}
    		},
    		d(detaching) {
    			if (detaching) detach(img);
    		}
    	};
    }

    function create_fragment$6(ctx) {
    	let div3;
    	let span0;
    	let i0;
    	let t0;
    	let t1;
    	let t2;
    	let div1;
    	let div0;
    	let div0_class_value;
    	let t3;
    	let div2;
    	let span1;
    	let t4;
    	let span2;
    	let input0;
    	let t5;
    	let label;
    	let t6_value = (/*webtoon*/ ctx[1] ? "List" : "Pages") + "";
    	let t6;
    	let t7;
    	let i2;
    	let t8;
    	let span3;
    	let t9;
    	let span4;
    	let form;
    	let input1;
    	let t10;
    	let span5;
    	let t11;
    	let span6;
    	let mangaconfig;
    	let t12;
    	let span7;
    	let current;
    	let mounted;
    	let dispose;

    	function select_block_type(ctx, dirty) {
    		if (!/*webtoon*/ ctx[1]) return create_if_block$4;
    		return create_else_block$1;
    	}

    	let current_block_type = select_block_type(ctx);
    	let if_block = current_block_type(ctx);

    	mangaconfig = new MangaConfig({
    			props: { config: /*config*/ ctx[7], ToggleMenu }
    		});

    	mangaconfig.$on("mconfig", /*onConfig*/ ctx[15]);

    	return {
    		c() {
    			div3 = element("div");
    			span0 = element("span");
    			i0 = element("i");
    			t0 = space();
    			t1 = text(/*progress*/ ctx[5]);
    			t2 = space();
    			div1 = element("div");
    			div0 = element("div");
    			if_block.c();
    			t3 = space();
    			div2 = element("div");
    			span1 = element("span");
    			span1.innerHTML = `<i class="far fa-times-circle popup-msg" data-title="Close"></i>`;
    			t4 = space();
    			span2 = element("span");
    			input0 = element("input");
    			t5 = space();
    			label = element("label");
    			t6 = text(t6_value);
    			t7 = space();
    			i2 = element("i");
    			t8 = space();
    			span3 = element("span");
    			span3.innerHTML = `<i class="fa fa-arrow-circle-left"></i>`;
    			t9 = space();
    			span4 = element("span");
    			form = element("form");
    			input1 = element("input");
    			t10 = space();
    			span5 = element("span");
    			span5.innerHTML = `<i class="fa fa-arrow-circle-right"></i>`;
    			t11 = space();
    			span6 = element("span");
    			create_component(mangaconfig.$$.fragment);
    			t12 = space();
    			span7 = element("span");
    			span7.innerHTML = `<i class="fas fa-expand-arrows-alt popup-msg" data-title="Full Screen"></i>`;
    			attr(i0, "class", "fas fa-sticky-note svelte-16u82nq");
    			attr(span0, "class", "fullscreen-progress svelte-16u82nq");
    			attr(div0, "class", div0_class_value = "" + (null_to_empty("img-current" + (/*webtoon*/ ctx[1] ? " webtoon-img" : "")) + " svelte-16u82nq"));
    			set_style(div0, "width", /*config*/ ctx[7].width + "%");
    			attr(div0, "tabindex", "0");
    			attr(div1, "class", "viewer");
    			attr(span1, "id", "hide-player");
    			attr(input0, "type", "checkbox");
    			attr(input0, "name", "");
    			attr(input0, "id", "webtoon");
    			attr(input0, "class", "svelte-16u82nq");
    			attr(i2, "class", "fas fa-eye svelte-16u82nq");
    			attr(label, "for", "webtoon");
    			attr(label, "class", "svelte-16u82nq");
    			attr(span2, "class", "web-toon");
    			attr(span3, "class", "prev-page");
    			attr(input1, "type", "text");
    			input1.value = "";
    			attr(input1, "placeholder", /*progress*/ ctx[5]);
    			attr(form, "action", "");
    			attr(span4, "class", "current-page");
    			attr(span5, "class", "next-page");
    			attr(span6, "class", "config svelte-16u82nq");
    			attr(span7, "class", "btn-fullscr");
    			attr(div2, "class", "controls svelte-16u82nq");
    			attr(div3, "id", "manga-viewer");
    			attr(div3, "tabindex", "0");
    			attr(div3, "class", "svelte-16u82nq");
    			toggle_class(div3, "hide", /*$ToggleMenu*/ ctx[8]);
    		},
    		m(target, anchor) {
    			insert(target, div3, anchor);
    			append(div3, span0);
    			append(span0, i0);
    			append(span0, t0);
    			append(span0, t1);
    			append(div3, t2);
    			append(div3, div1);
    			append(div1, div0);
    			if_block.m(div0, null);
    			/*div0_binding*/ ctx[22](div0);
    			append(div3, t3);
    			append(div3, div2);
    			append(div2, span1);
    			append(div2, t4);
    			append(div2, span2);
    			append(span2, input0);
    			input0.checked = /*webtoon*/ ctx[1];
    			append(span2, t5);
    			append(span2, label);
    			append(label, t6);
    			append(label, t7);
    			append(label, i2);
    			append(div2, t8);
    			append(div2, span3);
    			append(div2, t9);
    			append(div2, span4);
    			append(span4, form);
    			append(form, input1);
    			/*input1_binding*/ ctx[24](input1);
    			append(div2, t10);
    			append(div2, span5);
    			append(div2, t11);
    			append(div2, span6);
    			mount_component(mangaconfig, span6, null);
    			append(div2, t12);
    			append(div2, span7);
    			current = true;

    			if (!mounted) {
    				dispose = [
    					listen(div0, "touchstart", onTouchStart),
    					listen(div0, "touchend", onTouchEnd),
    					listen(div0, "mousedown", onTouchStart),
    					listen(div0, "mouseup", onTouchEnd),
    					listen(div0, "touchmove", onTouchMove),
    					listen(span1, "click", /*returnTo*/ ctx[14]),
    					listen(input0, "change", /*input0_change_handler*/ ctx[23]),
    					listen(span3, "click", /*prevPage*/ ctx[9]),
    					listen(input1, "focus", /*onInputFocus*/ ctx[11]),
    					listen(input1, "blur", /*onInputBlur*/ ctx[12]),
    					listen(input1, "keydown", stop_propagation(/*keydown_handler*/ ctx[21])),
    					listen(form, "submit", prevent_default(/*jumpToPage*/ ctx[13])),
    					listen(span5, "click", /*nextPage*/ ctx[10]),
    					listen(span7, "click", function () {
    						if (is_function(/*Fullscreen*/ ctx[4].action)) /*Fullscreen*/ ctx[4].action.apply(this, arguments);
    					})
    				];

    				mounted = true;
    			}
    		},
    		p(new_ctx, dirty) {
    			ctx = new_ctx;
    			if (!current || dirty[0] & /*progress*/ 32) set_data(t1, /*progress*/ ctx[5]);

    			if (current_block_type === (current_block_type = select_block_type(ctx)) && if_block) {
    				if_block.p(ctx, dirty);
    			} else {
    				if_block.d(1);
    				if_block = current_block_type(ctx);

    				if (if_block) {
    					if_block.c();
    					if_block.m(div0, null);
    				}
    			}

    			if (!current || dirty[0] & /*webtoon*/ 2 && div0_class_value !== (div0_class_value = "" + (null_to_empty("img-current" + (/*webtoon*/ ctx[1] ? " webtoon-img" : "")) + " svelte-16u82nq"))) {
    				attr(div0, "class", div0_class_value);
    			}

    			if (!current || dirty[0] & /*config*/ 128) {
    				set_style(div0, "width", /*config*/ ctx[7].width + "%");
    			}

    			if (dirty[0] & /*webtoon*/ 2) {
    				input0.checked = /*webtoon*/ ctx[1];
    			}

    			if ((!current || dirty[0] & /*webtoon*/ 2) && t6_value !== (t6_value = (/*webtoon*/ ctx[1] ? "List" : "Pages") + "")) set_data(t6, t6_value);

    			if (!current || dirty[0] & /*progress*/ 32) {
    				attr(input1, "placeholder", /*progress*/ ctx[5]);
    			}

    			const mangaconfig_changes = {};
    			if (dirty[0] & /*config*/ 128) mangaconfig_changes.config = /*config*/ ctx[7];
    			mangaconfig.$set(mangaconfig_changes);

    			if (dirty[0] & /*$ToggleMenu*/ 256) {
    				toggle_class(div3, "hide", /*$ToggleMenu*/ ctx[8]);
    			}
    		},
    		i(local) {
    			if (current) return;
    			transition_in(mangaconfig.$$.fragment, local);
    			current = true;
    		},
    		o(local) {
    			transition_out(mangaconfig.$$.fragment, local);
    			current = false;
    		},
    		d(detaching) {
    			if (detaching) detach(div3);
    			if_block.d();
    			/*div0_binding*/ ctx[22](null);
    			/*input1_binding*/ ctx[24](null);
    			destroy_component(mangaconfig);
    			mounted = false;
    			run_all(dispose);
    		}
    	};
    }

    function instance$6($$self, $$props, $$invalidate) {
    	let $ToggleMenu;
    	component_subscribe($$self, ToggleMenu, $$value => $$invalidate(8, $ToggleMenu = $$value));
    	let { file } = $$props;
    	let { KeyMap } = $$props;
    	let { viewer } = $$props;
    	const { NextFile, PrevFile, Fullscreen, SkipForward, SkipBack } = KeyMap;
    	const socket = getContext("socket");
    	const dispatch = createEventDispatcher();
    	let webtoon;
    	let progress = `${file.CurrentPos + 1}/${file.Duration}`;
    	let images = [file.Duration];
    	let loading = false;
    	let lastfId;
    	let imgContainer;
    	let isObserver = false;
    	let inputPage;
    	let jumping = false;

    	let config = {
    		width: window.innerWidth < 600
    		? 100
    		: localStorage.getItem("mWidth") || 65,
    		imgAbjust: "fill"
    	};

    	let indices = [];

    	const loadImages = (pg, toPage, dir = 1) => {
    		if (loading) return;
    		$$invalidate(20, indices = getEmptyIndex(images, pg, toPage, dir, file.Duration));

    		if (indices.length > 0) {
    			socket.emit("loadzip-image", { Id: file.Id, indices });
    			loading = true;
    		} else if (jumping) {
    			scrollInViewAndSetObserver();
    		}
    	};

    	socket.on("image-loaded", data => {
    		if (!data.last) {
    			$$invalidate(2, images[data.page] = data.img, images);
    		} else {
    			loading = false;
    			$$invalidate(20, indices = []);

    			if (jumping && webtoon) {
    				jumping = false;
    				scrollInViewAndSetObserver(100);
    			}
    		}
    	});

    	const prevPage = () => {
    		let pg = file.CurrentPos - 1;

    		if (pg > -1) {
    			if (webtoon) {
    				scrollInView(pg);
    			} else {
    				if (!images[pg - 7] && !loading) {
    					loadImages(pg, 8, -1);
    				}
    			}

    			$$invalidate(0, file.CurrentPos = pg, file);
    		} else {
    			jumping = true;
    			PrevFile.action();
    		}
    	};

    	const nextPage = () => {
    		let pg = file.CurrentPos + 1;

    		if (pg < file.Duration) {
    			if (webtoon) {
    				scrollInView(pg);
    			} else {
    				if (!images[pg + 7] && !loading) {
    					loadImages(pg, 8);
    				}
    			}

    			$$invalidate(0, file.CurrentPos = pg, file);
    		} else {
    			jumping = true;
    			disconnectObvrs(imgContainer);
    			NextFile.action();
    		}
    	};

    	const onInputFocus = () => {
    		$$invalidate(6, inputPage.value = file.CurrentPos + 1, inputPage);
    	};

    	const onInputBlur = () => {
    		$$invalidate(6, inputPage.value = "", inputPage);
    	};

    	const jumpToPage = event => {
    		let val = parseInt(inputPage.value);
    		if (isNaN(val)) return onInputFocus();

    		val < 0
    		? 0
    		: val >= file.Duration ? file.Duration - 1 : val;

    		$$invalidate(0, file.CurrentPos = val - 1, file);

    		if (webtoon) {
    			jumping = true;
    			disconnectObvrs(imgContainer);
    		}

    		loadImages(val - 5, 10);
    		onInputBlur();
    	};

    	const returnTo = () => dispatch("returnBack");
    	SkipForward.action = nextPage;
    	SkipBack.action = prevPage;

    	const setPage = pg => {
    		$$invalidate(0, file.CurrentPos = pg, file);
    	};

    	let scrollInViewAndSetObserver = (delay = 0) => {
    		let tout = setTimeout(
    			() => {
    				scrollInView(file.CurrentPos);
    				PageObserver(setPage, imgContainer, loadImages);
    				scrollImageLoader(loadImages, imgContainer, file.CurrentPos);
    				clearTimeout(tout);
    			},
    			delay
    		);
    	};

    	Fullscreen.action = () => {
    		if (webtoon) {
    			disconnectObvrs(imgContainer);
    			setfullscreen(viewer);
    			scrollInViewAndSetObserver(200);
    		} else {
    			setfullscreen(viewer);
    		}
    	};

    	const onConfig = ({ detail }) => {
    		$$invalidate(7, config = detail);
    	};

    	controls.prevPage = prevPage;
    	controls.nextPage = nextPage;
    	controls.fullScreen = Fullscreen.action;
    	controls.nextFile = NextFile.action;
    	controls.prevFile = PrevFile.action;
    	controls.file = file;

    	onDestroy(() => {
    		delete socket._callbacks["$image-loaded"];
    		disconnectObvrs(imgContainer);
    	});

    	function keydown_handler(event) {
    		bubble.call(this, $$self, event);
    	}

    	function div0_binding($$value) {
    		binding_callbacks[$$value ? 'unshift' : 'push'](() => {
    			imgContainer = $$value;
    			$$invalidate(3, imgContainer);
    		});
    	}

    	function input0_change_handler() {
    		webtoon = this.checked;
    		$$invalidate(1, webtoon);
    	}

    	function input1_binding($$value) {
    		binding_callbacks[$$value ? 'unshift' : 'push'](() => {
    			inputPage = $$value;
    			$$invalidate(6, inputPage);
    		});
    	}

    	$$self.$$set = $$props => {
    		if ('file' in $$props) $$invalidate(0, file = $$props.file);
    		if ('KeyMap' in $$props) $$invalidate(16, KeyMap = $$props.KeyMap);
    		if ('viewer' in $$props) $$invalidate(17, viewer = $$props.viewer);
    	};

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty[0] & /*file*/ 1) {
    			$$invalidate(5, progress = `${parseInt(file.CurrentPos) + 1}/${file.Duration}`);
    		}

    		if ($$self.$$.dirty[0] & /*file, lastfId, imgContainer, images, indices*/ 1310733) {
    			if (file.Id !== lastfId) {
    				jumping = true;
    				$$invalidate(2, images = []);
    				$$invalidate(18, lastfId = file.Id);

    				if (imgContainer) {
    					disconnectObvrs(imgContainer);
    				}

    				$$invalidate(20, indices = getEmptyIndex(images, file.CurrentPos - 2, 8, 1, file.Duration));
    				socket.emit("loadzip-image", { Id: file.Id, indices });
    				controls.file = file;
    			}
    		}

    		if ($$self.$$.dirty[0] & /*webtoon, isObserver, imgContainer*/ 524298) {
    			if (webtoon) {
    				controls.webtoon = webtoon;

    				if (!isObserver) {
    					$$invalidate(19, isObserver = true);
    					scrollInViewAndSetObserver();
    				}
    			} else if (isObserver) {
    				controls.webtoon = webtoon;
    				$$invalidate(19, isObserver = false);
    				disconnectObvrs(imgContainer);
    			}
    		}
    	};

    	return [
    		file,
    		webtoon,
    		images,
    		imgContainer,
    		Fullscreen,
    		progress,
    		inputPage,
    		config,
    		$ToggleMenu,
    		prevPage,
    		nextPage,
    		onInputFocus,
    		onInputBlur,
    		jumpToPage,
    		returnTo,
    		onConfig,
    		KeyMap,
    		viewer,
    		lastfId,
    		isObserver,
    		indices,
    		keydown_handler,
    		div0_binding,
    		input0_change_handler,
    		input1_binding
    	];
    }

    class MangaViewer extends SvelteComponent {
    	constructor(options) {
    		super();
    		init(this, options, instance$6, create_fragment$6, safe_not_equal, { file: 0, KeyMap: 16, viewer: 17 }, null, [-1, -1]);
    	}
    }

    /* src\User\Component\Slider.svelte generated by Svelte v3.49.0 */
    const get_default_slot_changes = dirty => ({ value: dirty & /*previewData*/ 8 });
    const get_default_slot_context = ctx => ({ value: /*previewData*/ ctx[3].value });

    // (221:4) {#if preview}
    function create_if_block$3(ctx) {
    	let span1;
    	let span0;
    	let span1_style_value;
    	let current;
    	const default_slot_template = /*#slots*/ ctx[14].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[13], get_default_slot_context);

    	return {
    		c() {
    			span1 = element("span");
    			span0 = element("span");
    			if (default_slot) default_slot.c();
    			attr(span0, "class", "rc-preview-content svelte-hkabeq");
    			attr(span1, "class", "rc-preview svelte-hkabeq");
    			attr(span1, "data-title", "00:00");
    			attr(span1, "style", span1_style_value = `left: calc(${/*previewData*/ ctx[3].pos}% - ${/*previewRef*/ ctx[2] && /*previewRef*/ ctx[2].offsetWidth / 2}px)`);
    		},
    		m(target, anchor) {
    			insert(target, span1, anchor);
    			append(span1, span0);

    			if (default_slot) {
    				default_slot.m(span0, null);
    			}

    			/*span1_binding*/ ctx[15](span1);
    			current = true;
    		},
    		p(ctx, dirty) {
    			if (default_slot) {
    				if (default_slot.p && (!current || dirty & /*$$scope, previewData*/ 8200)) {
    					update_slot_base(
    						default_slot,
    						default_slot_template,
    						ctx,
    						/*$$scope*/ ctx[13],
    						!current
    						? get_all_dirty_from_scope(/*$$scope*/ ctx[13])
    						: get_slot_changes(default_slot_template, /*$$scope*/ ctx[13], dirty, get_default_slot_changes),
    						get_default_slot_context
    					);
    				}
    			}

    			if (!current || dirty & /*previewData, previewRef*/ 12 && span1_style_value !== (span1_style_value = `left: calc(${/*previewData*/ ctx[3].pos}% - ${/*previewRef*/ ctx[2] && /*previewRef*/ ctx[2].offsetWidth / 2}px)`)) {
    				attr(span1, "style", span1_style_value);
    			}
    		},
    		i(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d(detaching) {
    			if (detaching) detach(span1);
    			if (default_slot) default_slot.d(detaching);
    			/*span1_binding*/ ctx[15](null);
    		}
    	};
    }

    function create_fragment$5(ctx) {
    	let div2;
    	let div1;
    	let div0;
    	let div0_style_value;
    	let t0;
    	let span;
    	let span_style_value;
    	let t1;
    	let current;
    	let mounted;
    	let dispose;
    	let if_block = /*preview*/ ctx[0] && create_if_block$3(ctx);

    	return {
    		c() {
    			div2 = element("div");
    			div1 = element("div");
    			div0 = element("div");
    			t0 = space();
    			span = element("span");
    			t1 = space();
    			if (if_block) if_block.c();
    			attr(div0, "class", "rc-progress svelte-hkabeq");

    			attr(div0, "style", div0_style_value = `border-radius: ${Math.round(/*progress*/ ctx[4]) === 100
			? '0.3rem'
			: '0.3rem 0px 0px 0.3rem'}; width: ${/*progress*/ ctx[4] > 0.3 ? /*progress*/ ctx[4] : 0}%`);

    			attr(span, "class", "rc-thumb svelte-hkabeq");
    			attr(span, "style", span_style_value = `left: calc(${/*progress*/ ctx[4]}% - 11px)`);
    			attr(div1, "id", /*uniqId*/ ctx[5]);
    			attr(div1, "class", "rc-track svelte-hkabeq");
    			attr(div2, "class", "rc-slider svelte-hkabeq");
    		},
    		m(target, anchor) {
    			insert(target, div2, anchor);
    			append(div2, div1);
    			append(div1, div0);
    			append(div1, t0);
    			append(div1, span);
    			append(div1, t1);
    			if (if_block) if_block.m(div1, null);
    			/*div1_binding*/ ctx[16](div1);
    			current = true;

    			if (!mounted) {
    				dispose = [
    					listen(span, "mousedown", /*handleThumb*/ ctx[8]),
    					listen(div1, "mousedown", /*onMDown*/ ctx[6]),
    					listen(div1, "touchstart", /*onMDown*/ ctx[6]),
    					listen(div1, "mousemove", /*onPreview*/ ctx[7])
    				];

    				mounted = true;
    			}
    		},
    		p(ctx, [dirty]) {
    			if (!current || dirty & /*progress*/ 16 && div0_style_value !== (div0_style_value = `border-radius: ${Math.round(/*progress*/ ctx[4]) === 100
			? '0.3rem'
			: '0.3rem 0px 0px 0.3rem'}; width: ${/*progress*/ ctx[4] > 0.3 ? /*progress*/ ctx[4] : 0}%`)) {
    				attr(div0, "style", div0_style_value);
    			}

    			if (!current || dirty & /*progress*/ 16 && span_style_value !== (span_style_value = `left: calc(${/*progress*/ ctx[4]}% - 11px)`)) {
    				attr(span, "style", span_style_value);
    			}

    			if (/*preview*/ ctx[0]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);

    					if (dirty & /*preview*/ 1) {
    						transition_in(if_block, 1);
    					}
    				} else {
    					if_block = create_if_block$3(ctx);
    					if_block.c();
    					transition_in(if_block, 1);
    					if_block.m(div1, null);
    				}
    			} else if (if_block) {
    				group_outros();

    				transition_out(if_block, 1, 1, () => {
    					if_block = null;
    				});

    				check_outros();
    			}
    		},
    		i(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d(detaching) {
    			if (detaching) detach(div2);
    			if (if_block) if_block.d();
    			/*div1_binding*/ ctx[16](null);
    			mounted = false;
    			run_all(dispose);
    		}
    	};
    }

    function instance$5($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	let { value } = $$props;
    	let { preview = false } = $$props;
    	let { min = 0 } = $$props;
    	let { max = 100 } = $$props;
    	let { onChange } = $$props;
    	createEventDispatcher();
    	let uniqId = "rc-" + new Date().getTime();
    	let sliderRef;
    	let previewRef;
    	let previewData = 0;
    	let progress = map(value, min, max, 0, 100);
    	let isMdown = { is: false };

    	const onMDown = e => {
    		isMdown = { is: true, id: uniqId };
    		let xpos;

    		if (e.type === "touchstart") {
    			xpos = e.touches[0].pageX - e.touches[0].target.getBoundingClientRect().left;
    			document.addEventListener("touchmove", globalMMove);
    		} else {
    			xpos = e.offsetX;
    			document.addEventListener("mousemove", globalMMove);
    		}

    		if (!isNaN(xpos)) {
    			updateValue(xpos);
    		}
    	};

    	const globalMMove = e => {
    		if (isMdown.is && e.target.id === uniqId || e.type === "touchmove" && e.touches[0].target.id === uniqId) {
    			let newPos;

    			if (e.type === "touchmove") {
    				newPos = e.touches[0].pageX - e.touches[0].target.getBoundingClientRect().left;
    			} else {
    				newPos = e.offsetX;
    			}

    			if (newPos > 0 && newPos < sliderRef.offsetWidth) {
    				updateValue(newPos);
    			}
    		}
    	};

    	const onPreview = e => {
    		if (preview) {
    			var newPos = Math.floor(e.pageX - sliderRef.getBoundingClientRect().left);
    			var pos = map(newPos - 1, 0, sliderRef.offsetWidth - 2, 0, 100).toFixed(0);
    			let tempVal = Number(map(newPos - 1, 0, sliderRef.offsetWidth - 2, min, max).toFixed(2));
    			pos = pos < 0 ? 0 : pos > 100 ? 100 : pos;
    			let value = tempVal < 0 ? 0 : tempVal > max ? max : tempVal;
    			$$invalidate(3, previewData = { pos, value });
    		}
    	};

    	document.onmouseup = e => {
    		isMdown = false;
    		document.removeEventListener("mousemove", globalMMove);
    		document.removeEventListener("touchmove", globalMMove);
    	};

    	const handleThumb = e => {
    		isMdown = { is: true, id: uniqId };

    		if (e.type === "touchstart") {
    			document.addEventListener("touchmove", globalMMove);
    		} else {
    			document.addEventListener("mousemove", globalMMove);
    		}

    		e.stopPropagation();
    	};

    	const updateValue = val => {
    		let tempVal = Number(map(val - 1, 0, sliderRef.offsetWidth - 2, min, max).toFixed(2));
    		tempVal = tempVal < 0 ? 0 : tempVal > max ? max : tempVal;
    		onChange(tempVal);
    	};

    	function span1_binding($$value) {
    		binding_callbacks[$$value ? 'unshift' : 'push'](() => {
    			previewRef = $$value;
    			$$invalidate(2, previewRef);
    		});
    	}

    	function div1_binding($$value) {
    		binding_callbacks[$$value ? 'unshift' : 'push'](() => {
    			sliderRef = $$value;
    			$$invalidate(1, sliderRef);
    		});
    	}

    	$$self.$$set = $$props => {
    		if ('value' in $$props) $$invalidate(9, value = $$props.value);
    		if ('preview' in $$props) $$invalidate(0, preview = $$props.preview);
    		if ('min' in $$props) $$invalidate(10, min = $$props.min);
    		if ('max' in $$props) $$invalidate(11, max = $$props.max);
    		if ('onChange' in $$props) $$invalidate(12, onChange = $$props.onChange);
    		if ('$$scope' in $$props) $$invalidate(13, $$scope = $$props.$$scope);
    	};

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*value, min, max*/ 3584) {
    			$$invalidate(4, progress = map(value, min, max, 0, 100));
    		}
    	};

    	return [
    		preview,
    		sliderRef,
    		previewRef,
    		previewData,
    		progress,
    		uniqId,
    		onMDown,
    		onPreview,
    		handleThumb,
    		value,
    		min,
    		max,
    		onChange,
    		$$scope,
    		slots,
    		span1_binding,
    		div1_binding
    	];
    }

    class Slider extends SvelteComponent {
    	constructor(options) {
    		super();

    		init(this, options, instance$5, create_fragment$5, safe_not_equal, {
    			value: 9,
    			preview: 0,
    			min: 10,
    			max: 11,
    			onChange: 12
    		});
    	}
    }

    const initialData = {
      startX: 0,
      endPosX: 0,
      startY: 0,
      endY: 0,
      time: 0,
    };

    var touching = false;
    var gestureDir = 0;
    var touchData = { ...initialData };
    let time = 0;
    const setGesture = (player) => {
      if (player) {
        player.onmousedown = player.ontouchstart = (e) => {
          touching = true;
          time = e.timeStamp;

          if (e.type !== "mousedown") {
            let { pageX, pageY } = e.touches[0];
            touchData = { time, startX: pageX, startY: pageY };
          } else if (e.which === 1) {
            player.paused ? player.play() : player.pause();
          }
        };

        player.ontouchmove = (e) => {
          if (touching) {
            let { pageX, pageY } = e.touches[0];
            let { startX, startY } = touchData;
            let deltaX = pageX - startX;
            let deltaY = pageY - startY;

            if (gestureDir === 0 && (deltaX > 10 || deltaX < -10)) {
              gestureDir = 1;
            } else if (gestureDir === 0 && (deltaY > 10 || deltaY < -10)) {
              gestureDir = 2;
            }

            if (gestureDir === 1 && !player.seeking) {
              if (deltaX > 20 || deltaX < -20) {
                let { duration, currentTime } = player;
                let seek = currentTime + (deltaX > 0 ? 5 : -5);
                player.currentTime = seek < 0 ? 0 : seek > duration ? duration : seek;
                touchData = { time: e.timeStamp, startX: pageX, startY: pageY };
              }
            } else if (gestureDir === 2) {
              if (deltaY > 2 || deltaY < -2) {
                let vol = player.volume + (deltaY < 0 ? 0.03 : -0.03);
                player.volume = vol < 0 ? 0 : vol > 1 ? 1 : vol;
                touchData = { time: e.timeStamp, startX: pageX, startY: pageY };
              }
            }
          }
        };

        player.onmouseup = player.ontouchend = (e) => {
          touching = false;

          touchData = { initialData };
          gestureDir = 0;
        };
      }
    };

    /* src\User\Component\VideoPlayer.svelte generated by Svelte v3.49.0 */

    function create_if_block$2(ctx) {
    	let div4;
    	let div3;
    	let video;
    	let track;
    	let video_src_value;
    	let video_poster_value;
    	let video_is_paused = true;
    	let t0;
    	let div2;
    	let div0;
    	let span0;
    	let t1;
    	let t2;
    	let slider;
    	let t3;
    	let div1;
    	let span1;
    	let t4;
    	let span2;
    	let t5;
    	let label0;
    	let input0;
    	let t6;
    	let i2;
    	let i2_class_value;
    	let t7;
    	let span3;
    	let t8;
    	let span4;
    	let t9;
    	let span5;
    	let input1;
    	let input1_value_value;
    	let t10;
    	let label1;
    	let input2;
    	let input2_checked_value;
    	let t11;
    	let i5;
    	let current;
    	let mounted;
    	let dispose;

    	slider = new Slider({
    			props: {
    				min: 0,
    				max: /*file*/ ctx[0].Duration,
    				value: /*file*/ ctx[0].CurrentPos,
    				onChange: /*onSeek*/ ctx[10],
    				preview: true,
    				$$slots: {
    					default: [
    						create_default_slot$1,
    						({ value }) => ({ 33: value }),
    						({ value }) => [0, value ? 4 : 0]
    					]
    				},
    				$$scope: { ctx }
    			}
    		});

    	return {
    		c() {
    			div4 = element("div");
    			div3 = element("div");
    			video = element("video");
    			track = element("track");
    			t0 = space();
    			div2 = element("div");
    			div0 = element("div");
    			span0 = element("span");
    			t1 = text(/*progress*/ ctx[3]);
    			t2 = space();
    			create_component(slider.$$.fragment);
    			t3 = space();
    			div1 = element("div");
    			span1 = element("span");
    			span1.innerHTML = `<i class="far fa-times-circle svelte-1cmvqct"></i>`;
    			t4 = space();
    			span2 = element("span");
    			span2.innerHTML = `<i class="far fa-arrow-alt-circle-left svelte-1cmvqct"></i>`;
    			t5 = space();
    			label0 = element("label");
    			input0 = element("input");
    			t6 = space();
    			i2 = element("i");
    			t7 = space();
    			span3 = element("span");
    			span3.innerHTML = `<i class="far fa-arrow-alt-circle-right svelte-1cmvqct"></i>`;
    			t8 = space();
    			span4 = element("span");
    			span4.innerHTML = `<i class="fas fa-expand-arrows-alt svelte-1cmvqct"></i>`;
    			t9 = space();
    			span5 = element("span");
    			input1 = element("input");
    			t10 = space();
    			label1 = element("label");
    			input2 = element("input");
    			t11 = space();
    			i5 = element("i");
    			attr(track, "kind", "captions");
    			attr(video, "class", "player svelte-1cmvqct");
    			if (!src_url_equal(video.src, video_src_value = `/api/viewer/${/*file*/ ctx[0].Id}`)) attr(video, "src", video_src_value);
    			attr(video, "preload", "metadata");
    			video.controls = false;
    			video.autoplay = true;
    			attr(video, "poster", video_poster_value = /*file*/ ctx[0].Cover);
    			video.loop = false;
    			attr(span0, "id", "v-progress");
    			attr(span0, "class", "svelte-1cmvqct");
    			attr(div0, "class", "v-seeker svelte-1cmvqct");
    			attr(span1, "class", "svelte-1cmvqct");
    			attr(span2, "class", "prev-page svelte-1cmvqct");
    			attr(input0, "type", "checkbox");
    			attr(input0, "id", "v-play");
    			attr(input0, "class", "svelte-1cmvqct");
    			attr(i2, "class", i2_class_value = "" + (null_to_empty(`far fa-${/*mConfig*/ ctx[2].pause ? 'play' : 'pause'}-circle`) + " svelte-1cmvqct"));
    			attr(label0, "for", "v-play");
    			attr(label0, "class", "svelte-1cmvqct");
    			attr(span3, "class", "next-page svelte-1cmvqct");
    			attr(span4, "class", "svelte-1cmvqct");
    			attr(input1, "type", "range");
    			attr(input1, "min", 0);
    			attr(input1, "max", 1);
    			attr(input1, "step", 0.05);
    			input1.value = input1_value_value = /*mConfig*/ ctx[2].volume;
    			attr(input1, "class", "svelte-1cmvqct");
    			attr(input2, "id", "v-mute");
    			attr(input2, "type", "checkbox");
    			attr(input2, "class", "vol-ctrl svelte-1cmvqct");
    			input2.checked = input2_checked_value = /*mConfig*/ ctx[2].volume === 0;
    			attr(i5, "class", "fas fa-volume-up popup-msg svelte-1cmvqct");
    			attr(i5, "data-title", "Mute");
    			attr(label1, "for", "v-mute");
    			attr(label1, "class", "svelte-1cmvqct");
    			attr(span5, "class", "v-vol svelte-1cmvqct");
    			attr(div1, "class", "player-btns svelte-1cmvqct");
    			attr(div2, "class", "player-controls svelte-1cmvqct");
    			attr(div3, "class", "player-content svelte-1cmvqct");
    			attr(div4, "class", "player-container svelte-1cmvqct");
    			attr(div4, "tabindex", "0");
    			toggle_class(div4, "isFullScreen", /*isFullScreen*/ ctx[4]);
    		},
    		m(target, anchor) {
    			insert(target, div4, anchor);
    			append(div4, div3);
    			append(div3, video);
    			append(video, track);
    			/*video_binding*/ ctx[24](video);

    			if (!isNaN(/*mConfig*/ ctx[2].volume)) {
    				video.volume = /*mConfig*/ ctx[2].volume;
    			}

    			append(div3, t0);
    			append(div3, div2);
    			append(div2, div0);
    			append(div0, span0);
    			append(span0, t1);
    			append(div0, t2);
    			mount_component(slider, div0, null);
    			append(div2, t3);
    			append(div2, div1);
    			append(div1, span1);
    			append(div1, t4);
    			append(div1, span2);
    			append(div1, t5);
    			append(div1, label0);
    			append(label0, input0);
    			append(label0, t6);
    			append(label0, i2);
    			append(div1, t7);
    			append(div1, span3);
    			append(div1, t8);
    			append(div1, span4);
    			append(div1, t9);
    			append(div1, span5);
    			append(span5, input1);
    			append(span5, t10);
    			append(span5, label1);
    			append(label1, input2);
    			append(label1, t11);
    			append(label1, i5);
    			/*div2_binding*/ ctx[27](div2);
    			current = true;

    			if (!mounted) {
    				dispose = [
    					listen(video, "play", /*video_play_pause_handler*/ ctx[25]),
    					listen(video, "pause", /*video_play_pause_handler*/ ctx[25]),
    					listen(video, "volumechange", /*video_volumechange_handler*/ ctx[26]),
    					listen(video, "contextmenu", prevent_default(/*contextmenu_handler*/ ctx[23])),
    					listen(video, "loadedmetadata", /*onMeta*/ ctx[8]),
    					listen(video, "timeupdate", /*updateTime*/ ctx[16]),
    					listen(video, "click", /*hideControlsOnCLick*/ ctx[18]),
    					listen(span1, "click", /*onReturn*/ ctx[9]),
    					listen(span2, "click", /*PrevFile*/ ctx[7].action),
    					listen(input0, "change", /*onPlay*/ ctx[17]),
    					listen(span3, "click", /*NextFile*/ ctx[6].action),
    					listen(span4, "click", /*fullScreen*/ ctx[12]),
    					listen(input1, "input", /*volChange*/ ctx[13]),
    					listen(input2, "change", /*onMuted*/ ctx[11]),
    					listen(div2, "mousedown", stop_propagation(/*mousedown_handler*/ ctx[22])),
    					listen(div4, "mousemove", /*hideControls*/ ctx[14]),
    					listen(div4, "keydown", /*handleKeyboard*/ ctx[19]),
    					listen(div4, "wheel", /*onWheel*/ ctx[15])
    				];

    				mounted = true;
    			}
    		},
    		p(ctx, dirty) {
    			if (!current || dirty[0] & /*file*/ 1 && !src_url_equal(video.src, video_src_value = `/api/viewer/${/*file*/ ctx[0].Id}`)) {
    				attr(video, "src", video_src_value);
    			}

    			if (!current || dirty[0] & /*file*/ 1 && video_poster_value !== (video_poster_value = /*file*/ ctx[0].Cover)) {
    				attr(video, "poster", video_poster_value);
    			}

    			if (dirty[0] & /*mConfig*/ 4 && video_is_paused !== (video_is_paused = /*mConfig*/ ctx[2].pause)) {
    				video[video_is_paused ? "pause" : "play"]();
    			}

    			if (dirty[0] & /*mConfig*/ 4 && !isNaN(/*mConfig*/ ctx[2].volume)) {
    				video.volume = /*mConfig*/ ctx[2].volume;
    			}

    			if (!current || dirty[0] & /*progress*/ 8) set_data(t1, /*progress*/ ctx[3]);
    			const slider_changes = {};
    			if (dirty[0] & /*file*/ 1) slider_changes.max = /*file*/ ctx[0].Duration;
    			if (dirty[0] & /*file*/ 1) slider_changes.value = /*file*/ ctx[0].CurrentPos;

    			if (dirty[1] & /*$$scope, value*/ 12) {
    				slider_changes.$$scope = { dirty, ctx };
    			}

    			slider.$set(slider_changes);

    			if (!current || dirty[0] & /*mConfig*/ 4 && i2_class_value !== (i2_class_value = "" + (null_to_empty(`far fa-${/*mConfig*/ ctx[2].pause ? 'play' : 'pause'}-circle`) + " svelte-1cmvqct"))) {
    				attr(i2, "class", i2_class_value);
    			}

    			if (!current || dirty[0] & /*mConfig*/ 4 && input1_value_value !== (input1_value_value = /*mConfig*/ ctx[2].volume)) {
    				input1.value = input1_value_value;
    			}

    			if (!current || dirty[0] & /*mConfig*/ 4 && input2_checked_value !== (input2_checked_value = /*mConfig*/ ctx[2].volume === 0)) {
    				input2.checked = input2_checked_value;
    			}

    			if (dirty[0] & /*isFullScreen*/ 16) {
    				toggle_class(div4, "isFullScreen", /*isFullScreen*/ ctx[4]);
    			}
    		},
    		i(local) {
    			if (current) return;
    			transition_in(slider.$$.fragment, local);
    			current = true;
    		},
    		o(local) {
    			transition_out(slider.$$.fragment, local);
    			current = false;
    		},
    		d(detaching) {
    			if (detaching) detach(div4);
    			/*video_binding*/ ctx[24](null);
    			destroy_component(slider);
    			/*div2_binding*/ ctx[27](null);
    			mounted = false;
    			run_all(dispose);
    		}
    	};
    }

    // (259:20) <Slider                          min={0}                          max={file.Duration}                          value={file.CurrentPos}                          onChange={onSeek}                          preview={true}                          let:value>
    function create_default_slot$1(ctx) {
    	let t_value = formatTime(/*value*/ ctx[33] + 2) + "";
    	let t;

    	return {
    		c() {
    			t = text(t_value);
    		},
    		m(target, anchor) {
    			insert(target, t, anchor);
    		},
    		p(ctx, dirty) {
    			if (dirty[1] & /*value*/ 4 && t_value !== (t_value = formatTime(/*value*/ ctx[33] + 2) + "")) set_data(t, t_value);
    		},
    		d(detaching) {
    			if (detaching) detach(t);
    		}
    	};
    }

    function create_fragment$4(ctx) {
    	let if_block_anchor;
    	let current;
    	let if_block = /*file*/ ctx[0].Id && create_if_block$2(ctx);

    	return {
    		c() {
    			if (if_block) if_block.c();
    			if_block_anchor = empty$1();
    		},
    		m(target, anchor) {
    			if (if_block) if_block.m(target, anchor);
    			insert(target, if_block_anchor, anchor);
    			current = true;
    		},
    		p(ctx, dirty) {
    			if (/*file*/ ctx[0].Id) {
    				if (if_block) {
    					if_block.p(ctx, dirty);

    					if (dirty[0] & /*file*/ 1) {
    						transition_in(if_block, 1);
    					}
    				} else {
    					if_block = create_if_block$2(ctx);
    					if_block.c();
    					transition_in(if_block, 1);
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			} else if (if_block) {
    				group_outros();

    				transition_out(if_block, 1, 1, () => {
    					if_block = null;
    				});

    				check_outros();
    			}
    		},
    		i(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d(detaching) {
    			if (if_block) if_block.d(detaching);
    			if (detaching) detach(if_block_anchor);
    		}
    	};
    }

    function instance$4($$self, $$props, $$invalidate) {
    	let { KeyMap } = $$props;
    	let { file } = $$props;
    	let { viewer } = $$props;
    	const { NextFile, PrevFile, SkipForward, SkipBack } = KeyMap;
    	const dispatch = createEventDispatcher();

    	let mConfig = {
    		time: false,
    		volume: 0.5,
    		pause: false,
    		muted: false
    	};

    	let player = {};
    	let progress;
    	let isFullScreen = false;
    	let controls;

    	const onMeta = e => {
    		$$invalidate(1, player.currentTime = file.CurrentPos, player);
    	};

    	const onReturn = () => {
    		dispatch("returnBack");
    	};

    	const onSeek = value => {
    		$$invalidate(1, player.currentTime = value, player);
    	};

    	const onMuted = ({ target }) => {
    		$$invalidate(1, player.muted = target.checked, player);
    	};

    	const fullScreen = () => {
    		setfullscreen(viewer);
    	};

    	const volChange = ({ target: { value } }) => {
    		$$invalidate(2, mConfig.volume = value, mConfig);
    	};

    	const onFullscreen = () => $$invalidate(4, isFullScreen = document.fullscreenElement !== null);

    	onMount(() => {
    		setGesture(player);
    		window.addEventListener("fullscreenchange", onFullscreen);
    		return () => window.removeEventListener("fullscreenchange", onFullscreen);
    	});

    	let tout;

    	const hideControls = () => {
    		if (isFullScreen && window.innerWidth > 1000) {
    			$$invalidate(5, controls.style.bottom = 0, controls);
    			clearTimeout(tout);

    			tout = setTimeout(
    				() => {
    					$$invalidate(5, controls.style.bottom = -controls.offsetHeight + "px", controls);
    				},
    				5000
    			);
    		}
    	};

    	const onWheel = ({ deltaY }) => {
    		let { volume } = mConfig;
    		volume += deltaY < 0 ? 0.05 : -0.05;
    		$$invalidate(2, mConfig.volume = volume < 0 ? 0 : volume > 1 ? 1 : volume, mConfig);
    	};

    	const updateTime = () => {
    		$$invalidate(0, file.CurrentPos = player.currentTime, file);
    	};

    	const onPlay = ({ target: { checked } }) => !checked ? player.play() : player.pause();

    	const hideControlsOnCLick = () => {
    		if (isFullScreen) {
    			if (controls.style.bottom == "0px") {
    				$$invalidate(5, controls.style.bottom = -controls.offsetHeight + "px", controls);
    				player.play();
    			} else {
    				$$invalidate(5, controls.style.bottom = 0, controls);
    				player.pause();
    			}
    		}
    	};

    	const handleKeyboard = ({ keyCode, ctrlKey }) => {
    		switch (keyCode) {
    			case 13:
    				{
    					fullScreen();
    					break;
    				}
    			case 39:
    				{
    					$$invalidate(1, player.currentTime += ctrlKey ? 10 : 5, player);
    					break;
    				}
    			case 37:
    				{
    					$$invalidate(1, player.currentTime -= ctrlKey ? 10 : 5, player);
    					break;
    				}
    			case 38:
    				{
    					let newVol = player.volume + 0.05;
    					$$invalidate(1, player.volume = newVol > 1.0 ? 1 : newVol, player);
    					break;
    				}
    			case 40:
    				{
    					let newVol = player.volume - 0.05;
    					$$invalidate(1, player.volume = newVol < 0 ? 0 : newVol, player);
    					break;
    				}
    			case 32:
    				{
    					player.paused ? player.play() : player.pause();
    					break;
    				}
    		}

    		console.log(keyCode);
    	};

    	function mousedown_handler(event) {
    		bubble.call(this, $$self, event);
    	}

    	function contextmenu_handler(event) {
    		bubble.call(this, $$self, event);
    	}

    	function video_binding($$value) {
    		binding_callbacks[$$value ? 'unshift' : 'push'](() => {
    			player = $$value;
    			$$invalidate(1, player);
    		});
    	}

    	function video_play_pause_handler() {
    		mConfig.pause = this.paused;
    		$$invalidate(2, mConfig);
    	}

    	function video_volumechange_handler() {
    		mConfig.volume = this.volume;
    		$$invalidate(2, mConfig);
    	}

    	function div2_binding($$value) {
    		binding_callbacks[$$value ? 'unshift' : 'push'](() => {
    			controls = $$value;
    			$$invalidate(5, controls);
    		});
    	}

    	$$self.$$set = $$props => {
    		if ('KeyMap' in $$props) $$invalidate(20, KeyMap = $$props.KeyMap);
    		if ('file' in $$props) $$invalidate(0, file = $$props.file);
    		if ('viewer' in $$props) $$invalidate(21, viewer = $$props.viewer);
    	};

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty[0] & /*player, file*/ 3) {
    			if (player) {
    				$$invalidate(3, progress = formatTime(file.CurrentPos) + "/" + formatTime(file.Duration));
    			}
    		}
    	};

    	return [
    		file,
    		player,
    		mConfig,
    		progress,
    		isFullScreen,
    		controls,
    		NextFile,
    		PrevFile,
    		onMeta,
    		onReturn,
    		onSeek,
    		onMuted,
    		fullScreen,
    		volChange,
    		hideControls,
    		onWheel,
    		updateTime,
    		onPlay,
    		hideControlsOnCLick,
    		handleKeyboard,
    		KeyMap,
    		viewer,
    		mousedown_handler,
    		contextmenu_handler,
    		video_binding,
    		video_play_pause_handler,
    		video_volumechange_handler,
    		div2_binding
    	];
    }

    class VideoPlayer extends SvelteComponent {
    	constructor(options) {
    		super();
    		init(this, options, instance$4, create_fragment$4, safe_not_equal, { KeyMap: 20, file: 0, viewer: 21 }, null, [-1, -1]);
    	}
    }

    /* src\User\pages\Viewer.svelte generated by Svelte v3.49.0 */

    function create_if_block_1$1(ctx) {
    	let videoplayer;
    	let current;

    	videoplayer = new VideoPlayer({
    			props: {
    				file: /*file*/ ctx[2],
    				KeyMap,
    				viewer: /*viewer*/ ctx[4]
    			}
    		});

    	videoplayer.$on("returnBack", /*returnBack*/ ctx[10]);

    	return {
    		c() {
    			create_component(videoplayer.$$.fragment);
    		},
    		m(target, anchor) {
    			mount_component(videoplayer, target, anchor);
    			current = true;
    		},
    		p(ctx, dirty) {
    			const videoplayer_changes = {};
    			if (dirty & /*file*/ 4) videoplayer_changes.file = /*file*/ ctx[2];
    			if (dirty & /*viewer*/ 16) videoplayer_changes.viewer = /*viewer*/ ctx[4];
    			videoplayer.$set(videoplayer_changes);
    		},
    		i(local) {
    			if (current) return;
    			transition_in(videoplayer.$$.fragment, local);
    			current = true;
    		},
    		o(local) {
    			transition_out(videoplayer.$$.fragment, local);
    			current = false;
    		},
    		d(detaching) {
    			destroy_component(videoplayer, detaching);
    		}
    	};
    }

    // (155:2) {#if file.Type.includes("Manga")}
    function create_if_block$1(ctx) {
    	let mangaviewer;
    	let current;

    	mangaviewer = new MangaViewer({
    			props: {
    				viewer: /*viewer*/ ctx[4],
    				file: /*file*/ ctx[2],
    				KeyMap
    			}
    		});

    	mangaviewer.$on("changefile", /*changeFile*/ ctx[9]);
    	mangaviewer.$on("returnBack", /*returnBack*/ ctx[10]);

    	return {
    		c() {
    			create_component(mangaviewer.$$.fragment);
    		},
    		m(target, anchor) {
    			mount_component(mangaviewer, target, anchor);
    			current = true;
    		},
    		p(ctx, dirty) {
    			const mangaviewer_changes = {};
    			if (dirty & /*viewer*/ 16) mangaviewer_changes.viewer = /*viewer*/ ctx[4];
    			if (dirty & /*file*/ 4) mangaviewer_changes.file = /*file*/ ctx[2];
    			mangaviewer.$set(mangaviewer_changes);
    		},
    		i(local) {
    			if (current) return;
    			transition_in(mangaviewer.$$.fragment, local);
    			current = true;
    		},
    		o(local) {
    			transition_out(mangaviewer.$$.fragment, local);
    			current = false;
    		},
    		d(detaching) {
    			destroy_component(mangaviewer, detaching);
    		}
    	};
    }

    function create_fragment$3(ctx) {
    	let div2;
    	let div0;
    	let span0;
    	let t0_value = /*file*/ ctx[2].Name + "";
    	let t0;
    	let t1;
    	let span2;
    	let span1;
    	let i;
    	let t2;
    	let t3_value = `${/*fileIndex*/ ctx[5] + 1} / ${/*playList*/ ctx[1].length}` + "";
    	let t3;
    	let t4;
    	let div1;
    	let t5;
    	let playlist;
    	let t6;
    	let show_if;
    	let show_if_1;
    	let current_block_type_index;
    	let if_block;
    	let current;
    	let mounted;
    	let dispose;

    	playlist = new PlayList({
    			props: {
    				fileId: /*fileId*/ ctx[0],
    				files: /*playList*/ ctx[1],
    				filters: /*filters*/ ctx[7]
    			}
    		});

    	playlist.$on("click", /*selectFile*/ ctx[8]);
    	playlist.$on("clearfilter", /*clearFilter*/ ctx[11]);
    	const if_block_creators = [create_if_block$1, create_if_block_1$1];
    	const if_blocks = [];

    	function select_block_type(ctx, dirty) {
    		if (dirty & /*file*/ 4) show_if = null;
    		if (dirty & /*file*/ 4) show_if_1 = null;
    		if (show_if == null) show_if = !!/*file*/ ctx[2].Type.includes("Manga");
    		if (show_if) return 0;
    		if (show_if_1 == null) show_if_1 = !!/*file*/ ctx[2].Type.includes("Video");
    		if (show_if_1) return 1;
    		return -1;
    	}

    	if (~(current_block_type_index = select_block_type(ctx, -1))) {
    		if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    	}

    	return {
    		c() {
    			div2 = element("div");
    			div0 = element("div");
    			span0 = element("span");
    			t0 = text(t0_value);
    			t1 = space();
    			span2 = element("span");
    			span1 = element("span");
    			i = element("i");
    			t2 = space();
    			t3 = text(t3_value);
    			t4 = space();
    			div1 = element("div");
    			t5 = space();
    			create_component(playlist.$$.fragment);
    			t6 = space();
    			if (if_block) if_block.c();
    			attr(span0, "class", "svelte-160yte1");
    			attr(div0, "class", "f-name svelte-160yte1");
    			toggle_class(div0, "nomenu", /*$ToggleMenu*/ ctx[6]);
    			attr(i, "class", "fas fa-file svelte-160yte1");
    			attr(span1, "id", "files-prog");
    			attr(span1, "class", "svelte-160yte1");
    			attr(div1, "id", "clock");
    			attr(div1, "class", "svelte-160yte1");
    			attr(span2, "class", "info svelte-160yte1");
    			toggle_class(span2, "top", /*file*/ ctx[2].Type.includes("Video"));
    			attr(div2, "class", "viewer svelte-160yte1");
    		},
    		m(target, anchor) {
    			insert(target, div2, anchor);
    			append(div2, div0);
    			append(div0, span0);
    			append(span0, t0);
    			/*div0_binding*/ ctx[15](div0);
    			append(div2, t1);
    			append(div2, span2);
    			append(span2, span1);
    			append(span1, i);
    			append(span1, t2);
    			append(span1, t3);
    			append(span2, t4);
    			append(span2, div1);
    			append(div2, t5);
    			mount_component(playlist, div2, null);
    			append(div2, t6);

    			if (~current_block_type_index) {
    				if_blocks[current_block_type_index].m(div2, null);
    			}

    			/*div2_binding*/ ctx[16](div2);
    			current = true;

    			if (!mounted) {
    				dispose = listen(div2, "keydown", handleKeyboard);
    				mounted = true;
    			}
    		},
    		p(ctx, [dirty]) {
    			if ((!current || dirty & /*file*/ 4) && t0_value !== (t0_value = /*file*/ ctx[2].Name + "")) set_data(t0, t0_value);

    			if (dirty & /*$ToggleMenu*/ 64) {
    				toggle_class(div0, "nomenu", /*$ToggleMenu*/ ctx[6]);
    			}

    			if ((!current || dirty & /*fileIndex, playList*/ 34) && t3_value !== (t3_value = `${/*fileIndex*/ ctx[5] + 1} / ${/*playList*/ ctx[1].length}` + "")) set_data(t3, t3_value);

    			if (dirty & /*file*/ 4) {
    				toggle_class(span2, "top", /*file*/ ctx[2].Type.includes("Video"));
    			}

    			const playlist_changes = {};
    			if (dirty & /*fileId*/ 1) playlist_changes.fileId = /*fileId*/ ctx[0];
    			if (dirty & /*playList*/ 2) playlist_changes.files = /*playList*/ ctx[1];
    			playlist.$set(playlist_changes);
    			let previous_block_index = current_block_type_index;
    			current_block_type_index = select_block_type(ctx, dirty);

    			if (current_block_type_index === previous_block_index) {
    				if (~current_block_type_index) {
    					if_blocks[current_block_type_index].p(ctx, dirty);
    				}
    			} else {
    				if (if_block) {
    					group_outros();

    					transition_out(if_blocks[previous_block_index], 1, 1, () => {
    						if_blocks[previous_block_index] = null;
    					});

    					check_outros();
    				}

    				if (~current_block_type_index) {
    					if_block = if_blocks[current_block_type_index];

    					if (!if_block) {
    						if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    						if_block.c();
    					} else {
    						if_block.p(ctx, dirty);
    					}

    					transition_in(if_block, 1);
    					if_block.m(div2, null);
    				} else {
    					if_block = null;
    				}
    			}
    		},
    		i(local) {
    			if (current) return;
    			transition_in(playlist.$$.fragment, local);
    			transition_in(if_block);
    			current = true;
    		},
    		o(local) {
    			transition_out(playlist.$$.fragment, local);
    			transition_out(if_block);
    			current = false;
    		},
    		d(detaching) {
    			if (detaching) detach(div2);
    			/*div0_binding*/ ctx[15](null);
    			destroy_component(playlist);

    			if (~current_block_type_index) {
    				if_blocks[current_block_type_index].d();
    			}

    			/*div2_binding*/ ctx[16](null);
    			mounted = false;
    			dispose();
    		}
    	};
    }

    function instance$3($$self, $$props, $$invalidate) {
    	let $ToggleMenu;
    	component_subscribe($$self, ToggleMenu, $$value => $$invalidate(6, $ToggleMenu = $$value));
    	let { folderId } = $$props;
    	let { fileId } = $$props;
    	const basePath = location.pathname.replace(/(^\/+|\/+$)/g, "").split("/").slice(0, 3).join("/");
    	const socket = getContext("socket");
    	const { Fullscreen, NextFile, PrevFile } = KeyMap;
    	let files = [];
    	let playList = [];
    	let file = { Type: "" };
    	let fileName;
    	let viewer;
    	let fileIndex = 1;
    	let filters = { filter: "" };

    	onMount(async () => {
    		let { data } = await axios.post(`/api/viewer/folder`, { id: folderId });

    		if (!data.fail) {
    			$$invalidate(1, playList = files = data.files.sort((a, b) => {
    				let n1 = a.Name.replace("-", ".").match(/\d+.\d+|\d+/);
    				let n2 = b.Name.replace("-", ".").match(/\d+.\d+|\d+/);

    				if (n1 && n2) {
    					return Number(n1[0]) - Number(n2[0]);
    				} else {
    					return a.Name.replace("-", "Z").localeCompare(b.Name.replace("-", "Z"));
    				}
    			}));

    			const first = playList[0];

    			if (first) {
    				window.title = first.Cover.split("/")[2];
    			}
    		}

    		window.addEventListener("beforeunload", saveFile);

    		return () => {
    			window.removeEventListener("beforeunload", saveFile);
    		};
    	});

    	const saveFile = () => {
    		let { Id, CurrentPos } = file;
    		socket.emit("file-update-pos", { Id, CurrentPos });
    	};

    	const selectFile = ({ target: { id } }) => {
    		saveFile();
    		console.log("filter: ", filters.filter);

    		if (filters.filter) {
    			$$invalidate(1, playList = files.filter(f => f.Name.toLocaleLowerCase().includes(filters.filter.toLocaleLowerCase())));
    		} else {
    			$$invalidate(1, playList = files);
    		}

    		navigate(`/${basePath}/${id}`);
    	};

    	const changeFile = (dir = 0) => {
    		let temp = playList.findIndex(f => f.Id === fileId) + dir;

    		if (fileIndex > -1 && fileIndex < playList.length - 1) {
    			$$invalidate(5, fileIndex = temp);
    			saveFile();
    			navigate(`/${basePath}/${playList[fileIndex].Id}`);
    		}
    	};

    	const returnBack = () => {
    		saveFile();
    		const pathname = localStorage.getItem("content");
    		localStorage.setItem("fileId", file.Id);
    		navigate(pathname);
    	};

    	NextFile.action = () => changeFile(1);
    	NextFile.isctrl = true;
    	PrevFile.action = () => changeFile(-1);
    	PrevFile.isctrl = true;
    	let lastId;
    	let tout;

    	const clearFilter = () => {
    		console.log("clearfilter");
    		$$invalidate(1, playList = files);
    	};

    	let runningClock;

    	window.addEventListener("fullscreenchange", e => {
    		if (document.fullscreenElement) {
    			const clock = document.getElementById("clock");

    			if (clock) {
    				clock.innerText = new Date().toLocaleTimeString("en-US");

    				runningClock = setInterval(
    					() => {
    						clock.innerText = new Date().toLocaleTimeString("en-US");
    					},
    					1000
    				);
    			}
    		} else {
    			clearInterval(runningClock);
    			clock.innerText = "";
    		}

    		if ((/(android)|(iphone)/i).test(navigator.userAgent) && file.Type.includes("Video") && document.fullscreenElement) {
    			window.screen.orientation.lock("landscape");
    		} else {
    			window.screen.orientation.unlock();
    		}
    	});

    	function div0_binding($$value) {
    		binding_callbacks[$$value ? 'unshift' : 'push'](() => {
    			fileName = $$value;
    			((((($$invalidate(3, fileName), $$invalidate(2, file)), $$invalidate(13, lastId)), $$invalidate(14, tout)), $$invalidate(1, playList)), $$invalidate(0, fileId));
    		});
    	}

    	function div2_binding($$value) {
    		binding_callbacks[$$value ? 'unshift' : 'push'](() => {
    			viewer = $$value;
    			$$invalidate(4, viewer);
    		});
    	}

    	$$self.$$set = $$props => {
    		if ('folderId' in $$props) $$invalidate(12, folderId = $$props.folderId);
    		if ('fileId' in $$props) $$invalidate(0, fileId = $$props.fileId);
    	};

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*playList, fileId*/ 3) {
    			if (playList.length > 0) {
    				$$invalidate(2, file = playList.find(f => f.Id === fileId) || playList[0]);
    				$$invalidate(5, fileIndex = playList.findIndex(f => f.Id === fileId));
    			}
    		}

    		if ($$self.$$.dirty & /*file, lastId, tout, fileName*/ 24588) {
    			if (file.Id != lastId) {
    				$$invalidate(13, lastId = file.Id);
    				clearTimeout(tout);
    				$$invalidate(3, fileName.style.opacity = 1, fileName);

    				$$invalidate(14, tout = setTimeout(
    					() => {
    						if (fileName) $$invalidate(3, fileName.style.opacity = 0, fileName);
    					},
    					5000
    				));
    			}
    		}

    		if ($$self.$$.dirty & /*fileId, folderId*/ 4097) {
    			if (fileId) {
    				if (socket) socket.emit("recent-folder", { CurrentFile: fileId, FolderId: folderId });
    			}
    		}
    	};

    	return [
    		fileId,
    		playList,
    		file,
    		fileName,
    		viewer,
    		fileIndex,
    		$ToggleMenu,
    		filters,
    		selectFile,
    		changeFile,
    		returnBack,
    		clearFilter,
    		folderId,
    		lastId,
    		tout,
    		div0_binding,
    		div2_binding
    	];
    }

    class Viewer extends SvelteComponent {
    	constructor(options) {
    		super();
    		init(this, options, instance$3, create_fragment$3, safe_not_equal, { folderId: 12, fileId: 0 });
    	}
    }

    /* src\User\UserRoutes.svelte generated by Svelte v3.49.0 */

    function create_default_slot_2(ctx) {
    	let home;
    	let current;
    	home = new Home({});

    	return {
    		c() {
    			create_component(home.$$.fragment);
    		},
    		m(target, anchor) {
    			mount_component(home, target, anchor);
    			current = true;
    		},
    		i(local) {
    			if (current) return;
    			transition_in(home.$$.fragment, local);
    			current = true;
    		},
    		o(local) {
    			transition_out(home.$$.fragment, local);
    			current = false;
    		},
    		d(detaching) {
    			destroy_component(home, detaching);
    		}
    	};
    }

    // (40:2) <Route path="*">
    function create_default_slot_1(ctx) {
    	let div;

    	return {
    		c() {
    			div = element("div");
    			div.textContent = "Not found";
    		},
    		m(target, anchor) {
    			insert(target, div, anchor);
    		},
    		p: noop,
    		d(detaching) {
    			if (detaching) detach(div);
    		}
    	};
    }

    // (23:0) <Router>
    function create_default_slot(ctx) {
    	let navbar;
    	let t0;
    	let route0;
    	let t1;
    	let route1;
    	let t2;
    	let route2;
    	let t3;
    	let route3;
    	let t4;
    	let route4;
    	let t5;
    	let route5;
    	let t6;
    	let route6;
    	let t7;
    	let route7;
    	let t8;
    	let route8;
    	let t9;
    	let route9;
    	let t10;
    	let route10;
    	let current;
    	navbar = new Navbar({ props: { navItems: /*navItems*/ ctx[0] } });
    	navbar.$on("click", /*click_handler*/ ctx[1]);

    	route0 = new Route({
    			props: {
    				path: "/videos/content/:id/:page/:filter",
    				component: Content
    			}
    		});

    	route1 = new Route({
    			props: {
    				path: "/videos/viewer/:folderId/:fileId",
    				component: Viewer
    			}
    		});

    	route2 = new Route({
    			props: {
    				path: "/videos/:dir/:page/:filter",
    				component: Videos
    			}
    		});

    	route3 = new Route({
    			props: {
    				path: "/mangas/content/:id/:page/:filter",
    				component: Content
    			}
    		});

    	route4 = new Route({
    			props: {
    				path: "/mangas/viewer/:folderId/:fileId",
    				component: Viewer
    			}
    		});

    	route5 = new Route({
    			props: {
    				path: "/mangas/:dir/:page/:filter",
    				component: Mangas
    			}
    		});

    	route6 = new Route({
    			props: {
    				path: "/favorites/content/:id/:page/:filter",
    				component: Content
    			}
    		});

    	route7 = new Route({
    			props: {
    				path: "/favorites/:id/:page/:filter",
    				component: Favorites
    			}
    		});

    	route8 = new Route({
    			props: {
    				path: "/favorites/viewer/:folderId/:fileId",
    				component: Viewer
    			}
    		});

    	route9 = new Route({
    			props: {
    				exact: true,
    				path: "/",
    				$$slots: { default: [create_default_slot_2] },
    				$$scope: { ctx }
    			}
    		});

    	route10 = new Route({
    			props: {
    				path: "*",
    				$$slots: { default: [create_default_slot_1] },
    				$$scope: { ctx }
    			}
    		});

    	return {
    		c() {
    			create_component(navbar.$$.fragment);
    			t0 = space();
    			create_component(route0.$$.fragment);
    			t1 = space();
    			create_component(route1.$$.fragment);
    			t2 = space();
    			create_component(route2.$$.fragment);
    			t3 = space();
    			create_component(route3.$$.fragment);
    			t4 = space();
    			create_component(route4.$$.fragment);
    			t5 = space();
    			create_component(route5.$$.fragment);
    			t6 = space();
    			create_component(route6.$$.fragment);
    			t7 = space();
    			create_component(route7.$$.fragment);
    			t8 = space();
    			create_component(route8.$$.fragment);
    			t9 = space();
    			create_component(route9.$$.fragment);
    			t10 = space();
    			create_component(route10.$$.fragment);
    		},
    		m(target, anchor) {
    			mount_component(navbar, target, anchor);
    			insert(target, t0, anchor);
    			mount_component(route0, target, anchor);
    			insert(target, t1, anchor);
    			mount_component(route1, target, anchor);
    			insert(target, t2, anchor);
    			mount_component(route2, target, anchor);
    			insert(target, t3, anchor);
    			mount_component(route3, target, anchor);
    			insert(target, t4, anchor);
    			mount_component(route4, target, anchor);
    			insert(target, t5, anchor);
    			mount_component(route5, target, anchor);
    			insert(target, t6, anchor);
    			mount_component(route6, target, anchor);
    			insert(target, t7, anchor);
    			mount_component(route7, target, anchor);
    			insert(target, t8, anchor);
    			mount_component(route8, target, anchor);
    			insert(target, t9, anchor);
    			mount_component(route9, target, anchor);
    			insert(target, t10, anchor);
    			mount_component(route10, target, anchor);
    			current = true;
    		},
    		p(ctx, dirty) {
    			const route9_changes = {};

    			if (dirty & /*$$scope*/ 4) {
    				route9_changes.$$scope = { dirty, ctx };
    			}

    			route9.$set(route9_changes);
    			const route10_changes = {};

    			if (dirty & /*$$scope*/ 4) {
    				route10_changes.$$scope = { dirty, ctx };
    			}

    			route10.$set(route10_changes);
    		},
    		i(local) {
    			if (current) return;
    			transition_in(navbar.$$.fragment, local);
    			transition_in(route0.$$.fragment, local);
    			transition_in(route1.$$.fragment, local);
    			transition_in(route2.$$.fragment, local);
    			transition_in(route3.$$.fragment, local);
    			transition_in(route4.$$.fragment, local);
    			transition_in(route5.$$.fragment, local);
    			transition_in(route6.$$.fragment, local);
    			transition_in(route7.$$.fragment, local);
    			transition_in(route8.$$.fragment, local);
    			transition_in(route9.$$.fragment, local);
    			transition_in(route10.$$.fragment, local);
    			current = true;
    		},
    		o(local) {
    			transition_out(navbar.$$.fragment, local);
    			transition_out(route0.$$.fragment, local);
    			transition_out(route1.$$.fragment, local);
    			transition_out(route2.$$.fragment, local);
    			transition_out(route3.$$.fragment, local);
    			transition_out(route4.$$.fragment, local);
    			transition_out(route5.$$.fragment, local);
    			transition_out(route6.$$.fragment, local);
    			transition_out(route7.$$.fragment, local);
    			transition_out(route8.$$.fragment, local);
    			transition_out(route9.$$.fragment, local);
    			transition_out(route10.$$.fragment, local);
    			current = false;
    		},
    		d(detaching) {
    			destroy_component(navbar, detaching);
    			if (detaching) detach(t0);
    			destroy_component(route0, detaching);
    			if (detaching) detach(t1);
    			destroy_component(route1, detaching);
    			if (detaching) detach(t2);
    			destroy_component(route2, detaching);
    			if (detaching) detach(t3);
    			destroy_component(route3, detaching);
    			if (detaching) detach(t4);
    			destroy_component(route4, detaching);
    			if (detaching) detach(t5);
    			destroy_component(route5, detaching);
    			if (detaching) detach(t6);
    			destroy_component(route6, detaching);
    			if (detaching) detach(t7);
    			destroy_component(route7, detaching);
    			if (detaching) detach(t8);
    			destroy_component(route8, detaching);
    			if (detaching) detach(t9);
    			destroy_component(route9, detaching);
    			if (detaching) detach(t10);
    			destroy_component(route10, detaching);
    		}
    	};
    }

    function create_fragment$2(ctx) {
    	let router;
    	let current;

    	router = new Router({
    			props: {
    				$$slots: { default: [create_default_slot] },
    				$$scope: { ctx }
    			}
    		});

    	return {
    		c() {
    			create_component(router.$$.fragment);
    		},
    		m(target, anchor) {
    			mount_component(router, target, anchor);
    			current = true;
    		},
    		p(ctx, [dirty]) {
    			const router_changes = {};

    			if (dirty & /*$$scope*/ 4) {
    				router_changes.$$scope = { dirty, ctx };
    			}

    			router.$set(router_changes);
    		},
    		i(local) {
    			if (current) return;
    			transition_in(router.$$.fragment, local);
    			current = true;
    		},
    		o(local) {
    			transition_out(router.$$.fragment, local);
    			current = false;
    		},
    		d(detaching) {
    			destroy_component(router, detaching);
    		}
    	};
    }

    function instance$2($$self) {
    	const navItems = [
    		{ title: "Home", path: "/", class: "home" },
    		{
    			title: "Videos",
    			path: "/videos",
    			class: "film"
    		},
    		{
    			title: "Mangas",
    			path: "/mangas",
    			class: "book"
    		},
    		{
    			title: "Favorites",
    			path: "/favorites",
    			class: "heart"
    		}
    	];

    	FavoritesStores.set(getContext("User").favorites);

    	function click_handler(event) {
    		bubble.call(this, $$self, event);
    	}

    	return [navItems, click_handler];
    }

    class UserRoutes extends SvelteComponent {
    	constructor(options) {
    		super();
    		init(this, options, instance$2, create_fragment$2, safe_not_equal, {});
    	}
    }

    /* src\Login.svelte generated by Svelte v3.49.0 */

    function create_fragment$1(ctx) {
    	let div7;
    	let form;
    	let h3;
    	let t1;
    	let div1;
    	let div0;
    	let t2;
    	let input0;
    	let t3;
    	let div2;
    	let t4_value = /*error*/ ctx[1].name + "";
    	let t4;
    	let t5;
    	let div4;
    	let div3;
    	let t6;
    	let input1;
    	let t7;
    	let div5;
    	let t8_value = /*error*/ ctx[1].password + "";
    	let t8;
    	let t9;
    	let div6;
    	let mounted;
    	let dispose;

    	return {
    		c() {
    			div7 = element("div");
    			form = element("form");
    			h3 = element("h3");
    			h3.textContent = "Login";
    			t1 = space();
    			div1 = element("div");
    			div0 = element("div");
    			div0.innerHTML = `<label for="name" class="input-group-text svelte-c4yjcf"><i class="fas fa-user svelte-c4yjcf"></i></label>`;
    			t2 = space();
    			input0 = element("input");
    			t3 = space();
    			div2 = element("div");
    			t4 = text(t4_value);
    			t5 = space();
    			div4 = element("div");
    			div3 = element("div");
    			div3.innerHTML = `<label for="password" class="input-group-text svelte-c4yjcf"><i class="fas fa-key svelte-c4yjcf"></i></label>`;
    			t6 = space();
    			input1 = element("input");
    			t7 = space();
    			div5 = element("div");
    			t8 = text(t8_value);
    			t9 = space();
    			div6 = element("div");
    			div6.innerHTML = `<button class="btn" tabindex="0">Submit</button>`;
    			attr(h3, "class", "mb-4 svelte-c4yjcf");
    			attr(div0, "class", "input-group-prepend");
    			attr(input0, "id", "name");
    			attr(input0, "type", "text");
    			attr(input0, "class", "form-control");
    			attr(input0, "name", "username");
    			attr(input0, "placeholder", "Name");
    			attr(input0, "tabindex", "0");
    			attr(div1, "class", "input-group");
    			attr(div2, "id", "name-errors");
    			attr(div2, "class", "error text-left text-danger svelte-c4yjcf");
    			attr(div3, "class", "input-group-prepend");
    			attr(input1, "id", "password");
    			attr(input1, "type", "password");
    			attr(input1, "class", "form-control");
    			attr(input1, "name", "Password");
    			attr(input1, "placeholder", "Password");
    			attr(input1, "autocomplete", "on");
    			attr(input1, "tabindex", "0");
    			attr(div4, "class", "input-group");
    			attr(div5, "id", "pasword-errors");
    			attr(div5, "class", "error text-left text-danger svelte-c4yjcf");
    			attr(div6, "class", "form-footer");
    			attr(form, "method", "post");
    			attr(form, "class", "card bg-dark p-3 svelte-c4yjcf");
    			attr(div7, "id", "login-container");
    			attr(div7, "class", "svelte-c4yjcf");
    		},
    		m(target, anchor) {
    			insert(target, div7, anchor);
    			append(div7, form);
    			append(form, h3);
    			append(form, t1);
    			append(form, div1);
    			append(div1, div0);
    			append(div1, t2);
    			append(div1, input0);
    			set_input_value(input0, /*user*/ ctx[0].username);
    			append(form, t3);
    			append(form, div2);
    			append(div2, t4);
    			append(form, t5);
    			append(form, div4);
    			append(div4, div3);
    			append(div4, t6);
    			append(div4, input1);
    			set_input_value(input1, /*user*/ ctx[0].password);
    			append(form, t7);
    			append(form, div5);
    			append(div5, t8);
    			append(form, t9);
    			append(form, div6);

    			if (!mounted) {
    				dispose = [
    					listen(input0, "input", /*input0_input_handler*/ ctx[3]),
    					listen(input1, "input", /*input1_input_handler*/ ctx[4]),
    					listen(form, "submit", /*onSubmit*/ ctx[2])
    				];

    				mounted = true;
    			}
    		},
    		p(ctx, [dirty]) {
    			if (dirty & /*user*/ 1 && input0.value !== /*user*/ ctx[0].username) {
    				set_input_value(input0, /*user*/ ctx[0].username);
    			}

    			if (dirty & /*error*/ 2 && t4_value !== (t4_value = /*error*/ ctx[1].name + "")) set_data(t4, t4_value);

    			if (dirty & /*user*/ 1 && input1.value !== /*user*/ ctx[0].password) {
    				set_input_value(input1, /*user*/ ctx[0].password);
    			}

    			if (dirty & /*error*/ 2 && t8_value !== (t8_value = /*error*/ ctx[1].password + "")) set_data(t8, t8_value);
    		},
    		i: noop,
    		o: noop,
    		d(detaching) {
    			if (detaching) detach(div7);
    			mounted = false;
    			run_all(dispose);
    		}
    	};
    }

    function instance$1($$self, $$props, $$invalidate) {
    	const dispatch = createEventDispatcher();
    	let user = { username: "", password: "" };
    	let error = { name: "", password: "" };

    	const onSubmit = event => {
    		event.preventDefault();

    		axios.post("/api/users/login", user).then(({ data }) => {
    			if (data.isAutenticated) {
    				dispatch("login", { ...data, Id: "" });
    			} else {
    				if (name) {
    					$$invalidate(1, error.name = "User can't be empty", error);
    				} else {
    					$$invalidate(1, error.password = "Password can't be empty", error);
    				}
    			}
    		}).catch(err => {
    			if (err.toString().includes("Network Error")) {
    				$$invalidate(1, error.password = "server offline", error);
    			} else {
    				$$invalidate(1, error.password = "Server Error", error);
    			}
    		});
    	};

    	function input0_input_handler() {
    		user.username = this.value;
    		$$invalidate(0, user);
    	}

    	function input1_input_handler() {
    		user.password = this.value;
    		$$invalidate(0, user);
    	}

    	return [user, error, onSubmit, input0_input_handler, input1_input_handler];
    }

    class Login extends SvelteComponent {
    	constructor(options) {
    		super();
    		init(this, options, instance$1, create_fragment$1, safe_not_equal, {});
    	}
    }

    /* src\App.svelte generated by Svelte v3.49.0 */

    function create_else_block_1(ctx) {
    	let login;
    	let current;
    	login = new Login({});
    	login.$on("login", /*logIn*/ ctx[3]);

    	return {
    		c() {
    			create_component(login.$$.fragment);
    		},
    		m(target, anchor) {
    			mount_component(login, target, anchor);
    			current = true;
    		},
    		p: noop,
    		i(local) {
    			if (current) return;
    			transition_in(login.$$.fragment, local);
    			current = true;
    		},
    		o(local) {
    			transition_out(login.$$.fragment, local);
    			current = false;
    		},
    		d(detaching) {
    			destroy_component(login, detaching);
    		}
    	};
    }

    // (62:26) 
    function create_if_block_1(ctx) {
    	let show_if;
    	let current_block_type_index;
    	let if_block;
    	let if_block_anchor;
    	let current;
    	const if_block_creators = [create_if_block_2, create_else_block];
    	const if_blocks = [];

    	function select_block_type_1(ctx, dirty) {
    		if (dirty & /*user*/ 1) show_if = null;
    		if (show_if == null) show_if = !!/*user*/ ctx[0].role.includes("Admin");
    		if (show_if) return 0;
    		return 1;
    	}

    	current_block_type_index = select_block_type_1(ctx, -1);
    	if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);

    	return {
    		c() {
    			if_block.c();
    			if_block_anchor = empty$1();
    		},
    		m(target, anchor) {
    			if_blocks[current_block_type_index].m(target, anchor);
    			insert(target, if_block_anchor, anchor);
    			current = true;
    		},
    		p(ctx, dirty) {
    			let previous_block_index = current_block_type_index;
    			current_block_type_index = select_block_type_1(ctx, dirty);

    			if (current_block_type_index === previous_block_index) {
    				if_blocks[current_block_type_index].p(ctx, dirty);
    			} else {
    				group_outros();

    				transition_out(if_blocks[previous_block_index], 1, 1, () => {
    					if_blocks[previous_block_index] = null;
    				});

    				check_outros();
    				if_block = if_blocks[current_block_type_index];

    				if (!if_block) {
    					if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    					if_block.c();
    				} else {
    					if_block.p(ctx, dirty);
    				}

    				transition_in(if_block, 1);
    				if_block.m(if_block_anchor.parentNode, if_block_anchor);
    			}
    		},
    		i(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d(detaching) {
    			if_blocks[current_block_type_index].d(detaching);
    			if (detaching) detach(if_block_anchor);
    		}
    	};
    }

    // (60:2) {#if isAuthenticating}
    function create_if_block(ctx) {
    	let div;

    	return {
    		c() {
    			div = element("div");
    			div.textContent = "Loading";
    		},
    		m(target, anchor) {
    			insert(target, div, anchor);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d(detaching) {
    			if (detaching) detach(div);
    		}
    	};
    }

    // (65:4) {:else}
    function create_else_block(ctx) {
    	let userroutes;
    	let current;
    	userroutes = new UserRoutes({});
    	userroutes.$on("click", /*logout*/ ctx[2]);

    	return {
    		c() {
    			create_component(userroutes.$$.fragment);
    		},
    		m(target, anchor) {
    			mount_component(userroutes, target, anchor);
    			current = true;
    		},
    		p: noop,
    		i(local) {
    			if (current) return;
    			transition_in(userroutes.$$.fragment, local);
    			current = true;
    		},
    		o(local) {
    			transition_out(userroutes.$$.fragment, local);
    			current = false;
    		},
    		d(detaching) {
    			destroy_component(userroutes, detaching);
    		}
    	};
    }

    // (63:4) {#if user.role.includes("Admin")}
    function create_if_block_2(ctx) {
    	let adminroutes;
    	let current;
    	adminroutes = new AdminRoutes({});
    	adminroutes.$on("click", /*logout*/ ctx[2]);

    	return {
    		c() {
    			create_component(adminroutes.$$.fragment);
    		},
    		m(target, anchor) {
    			mount_component(adminroutes, target, anchor);
    			current = true;
    		},
    		p: noop,
    		i(local) {
    			if (current) return;
    			transition_in(adminroutes.$$.fragment, local);
    			current = true;
    		},
    		o(local) {
    			transition_out(adminroutes.$$.fragment, local);
    			current = false;
    		},
    		d(detaching) {
    			destroy_component(adminroutes, detaching);
    		}
    	};
    }

    function create_fragment(ctx) {
    	let div;
    	let current_block_type_index;
    	let if_block;
    	let current;
    	const if_block_creators = [create_if_block, create_if_block_1, create_else_block_1];
    	const if_blocks = [];

    	function select_block_type(ctx, dirty) {
    		if (/*isAuthenticating*/ ctx[1]) return 0;
    		if (/*user*/ ctx[0].username) return 1;
    		return 2;
    	}

    	current_block_type_index = select_block_type(ctx);
    	if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);

    	return {
    		c() {
    			div = element("div");
    			if_block.c();
    			attr(div, "id", "root");
    		},
    		m(target, anchor) {
    			insert(target, div, anchor);
    			if_blocks[current_block_type_index].m(div, null);
    			current = true;
    		},
    		p(ctx, [dirty]) {
    			let previous_block_index = current_block_type_index;
    			current_block_type_index = select_block_type(ctx);

    			if (current_block_type_index === previous_block_index) {
    				if_blocks[current_block_type_index].p(ctx, dirty);
    			} else {
    				group_outros();

    				transition_out(if_blocks[previous_block_index], 1, 1, () => {
    					if_blocks[previous_block_index] = null;
    				});

    				check_outros();
    				if_block = if_blocks[current_block_type_index];

    				if (!if_block) {
    					if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    					if_block.c();
    				} else {
    					if_block.p(ctx, dirty);
    				}

    				transition_in(if_block, 1);
    				if_block.m(div, null);
    			}
    		},
    		i(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d(detaching) {
    			if (detaching) detach(div);
    			if_blocks[current_block_type_index].d();
    		}
    	};
    }

    function isPwa() {
    	return ["fullscreen", "standalone", "minimal-ui"].some(displayMode => window.matchMedia("(display-mode: " + displayMode + ")").matches);
    }

    function instance($$self, $$props, $$invalidate) {
    	let socket;
    	let user = { username: "" };
    	let isAuthenticating = true;

    	onMount(async () => {
    		let resp = await axios.get("/api/users");

    		if (resp.data.isAutenticated) {
    			$$invalidate(0, user = resp.data);
    		}

    		$$invalidate(1, isAuthenticating = false);
    	});

    	const logout = async () => {
    		$$invalidate(0, user = {});
    		navigate("/login", { replace: true });
    		if (socket) socket.close();

    		if (isPwa()) {
    			history.go(-(history.length - 2));
    		}

    		try {
    			axios.get("/api/users/logout");
    		} catch(error) {
    			console.log(error);
    		}
    	};

    	const logIn = _user => {
    		$$invalidate(0, user = _user.detail);
    		navigate("/", { replace: true });
    	};

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*user, socket*/ 17) {
    			if (user.isAutenticated) {
    				$$invalidate(4, socket = lookup("/"));
    				setContext("socket", socket);
    				setContext("User", user);

    				socket.on("error", error => {
    					console.log(error);
    				});

    				setContext("logout", logout);
    			}
    		}
    	};

    	return [user, isAuthenticating, logout, logIn, socket];
    }

    class App extends SvelteComponent {
    	constructor(options) {
    		super();
    		init(this, options, instance, create_fragment, safe_not_equal, {});
    	}
    }

    window.local = localStorage;

    Storage.prototype.setObject = function (key, value) {
        this.setItem(key, JSON.stringify(value));
    };

    Storage.prototype.getObject = function (key) {
        let value = this.getItem(key);
        if (value === "undefined") return {};
        try {
            value = JSON.parse(value);
        } catch (err) {
            console.log(err);
        }
        return value;
    };

    window.addEventListener("load", () => {
        if ("serviceWorker" in navigator) {
            try {
                navigator.serviceWorker.register("/service-worker.js");
            } catch (err) {
                console.log(err);
            }
        }
    });

    const app = new App({
        target: document.body,
    });

    return app;

})();
