import { c as create_ssr_component, d as compute_rest_props, f as spread, h as escape_attribute_value, i as escape_object, e as escape, j as add_classes, k as add_attribute, v as validate_component, l as createEventDispatcher, m as missing_component, o as each } from "../../chunks/index.js";
import "maplibre-gl";
const MapComponent = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let { map } = $$props;
  if ($$props.map === void 0 && $$bindings.map && map !== void 0)
    $$bindings.map(map);
  return `<div id="${"map"}"></div>`;
});
const WarningFilled = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let labelled;
  let attributes;
  let $$restProps = compute_rest_props($$props, ["size", "title"]);
  let { size = 16 } = $$props;
  let { title = void 0 } = $$props;
  if ($$props.size === void 0 && $$bindings.size && size !== void 0)
    $$bindings.size(size);
  if ($$props.title === void 0 && $$bindings.title && title !== void 0)
    $$bindings.title(title);
  labelled = $$props["aria-label"] || $$props["aria-labelledby"] || title;
  attributes = {
    "aria-hidden": labelled ? void 0 : true,
    role: labelled ? "img" : void 0,
    focusable: Number($$props["tabindex"]) === 0 ? true : void 0
  };
  return `<svg${spread(
    [
      { xmlns: "http://www.w3.org/2000/svg" },
      { viewBox: "0 0 32 32" },
      { fill: "currentColor" },
      { preserveAspectRatio: "xMidYMid meet" },
      { width: escape_attribute_value(size) },
      { height: escape_attribute_value(size) },
      escape_object(attributes),
      escape_object($$restProps)
    ],
    {}
  )}>${title ? `<title>${escape(title)}</title>` : ``}<path d="${"M16,2C8.3,2,2,8.3,2,16s6.3,14,14,14s14-6.3,14-14C30,8.3,23.7,2,16,2z M14.9,8h2.2v11h-2.2V8z M16,25	c-0.8,0-1.5-0.7-1.5-1.5S15.2,22,16,22c0.8,0,1.5,0.7,1.5,1.5S16.8,25,16,25z"}"></path><path fill="${"none"}" d="${"M17.5,23.5c0,0.8-0.7,1.5-1.5,1.5c-0.8,0-1.5-0.7-1.5-1.5S15.2,22,16,22	C16.8,22,17.5,22.7,17.5,23.5z M17.1,8h-2.2v11h2.2V8z"}" data-icon-path="${"inner-path"}" opacity="${"0"}"></path></svg>`;
});
const WarningFilled$1 = WarningFilled;
const WarningAltFilled = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let labelled;
  let attributes;
  let $$restProps = compute_rest_props($$props, ["size", "title"]);
  let { size = 16 } = $$props;
  let { title = void 0 } = $$props;
  if ($$props.size === void 0 && $$bindings.size && size !== void 0)
    $$bindings.size(size);
  if ($$props.title === void 0 && $$bindings.title && title !== void 0)
    $$bindings.title(title);
  labelled = $$props["aria-label"] || $$props["aria-labelledby"] || title;
  attributes = {
    "aria-hidden": labelled ? void 0 : true,
    role: labelled ? "img" : void 0,
    focusable: Number($$props["tabindex"]) === 0 ? true : void 0
  };
  return `<svg${spread(
    [
      { xmlns: "http://www.w3.org/2000/svg" },
      { viewBox: "0 0 32 32" },
      { fill: "currentColor" },
      { preserveAspectRatio: "xMidYMid meet" },
      { width: escape_attribute_value(size) },
      { height: escape_attribute_value(size) },
      escape_object(attributes),
      escape_object($$restProps)
    ],
    {}
  )}>${title ? `<title>${escape(title)}</title>` : ``}<path fill="${"none"}" d="${"M16,26a1.5,1.5,0,1,1,1.5-1.5A1.5,1.5,0,0,1,16,26Zm-1.125-5h2.25V12h-2.25Z"}" data-icon-path="${"inner-path"}"></path><path d="${"M16.002,6.1714h-.004L4.6487,27.9966,4.6506,28H27.3494l.0019-.0034ZM14.875,12h2.25v9h-2.25ZM16,26a1.5,1.5,0,1,1,1.5-1.5A1.5,1.5,0,0,1,16,26Z"}"></path><path d="${"M29,30H3a1,1,0,0,1-.8872-1.4614l13-25a1,1,0,0,1,1.7744,0l13,25A1,1,0,0,1,29,30ZM4.6507,28H27.3493l.002-.0033L16.002,6.1714h-.004L4.6487,27.9967Z"}"></path></svg>`;
});
const WarningAltFilled$1 = WarningAltFilled;
const ListBox = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let $$restProps = compute_rest_props($$props, [
    "size",
    "type",
    "open",
    "light",
    "disabled",
    "invalid",
    "invalidText",
    "warn",
    "warnText"
  ]);
  let { size = void 0 } = $$props;
  let { type = "default" } = $$props;
  let { open = false } = $$props;
  let { light = false } = $$props;
  let { disabled = false } = $$props;
  let { invalid = false } = $$props;
  let { invalidText = "" } = $$props;
  let { warn = false } = $$props;
  let { warnText = "" } = $$props;
  if ($$props.size === void 0 && $$bindings.size && size !== void 0)
    $$bindings.size(size);
  if ($$props.type === void 0 && $$bindings.type && type !== void 0)
    $$bindings.type(type);
  if ($$props.open === void 0 && $$bindings.open && open !== void 0)
    $$bindings.open(open);
  if ($$props.light === void 0 && $$bindings.light && light !== void 0)
    $$bindings.light(light);
  if ($$props.disabled === void 0 && $$bindings.disabled && disabled !== void 0)
    $$bindings.disabled(disabled);
  if ($$props.invalid === void 0 && $$bindings.invalid && invalid !== void 0)
    $$bindings.invalid(invalid);
  if ($$props.invalidText === void 0 && $$bindings.invalidText && invalidText !== void 0)
    $$bindings.invalidText(invalidText);
  if ($$props.warn === void 0 && $$bindings.warn && warn !== void 0)
    $$bindings.warn(warn);
  if ($$props.warnText === void 0 && $$bindings.warnText && warnText !== void 0)
    $$bindings.warnText(warnText);
  return `<div${spread(
    [
      { role: "listbox" },
      { tabindex: "-1" },
      {
        "data-invalid": escape_attribute_value(invalid || void 0)
      },
      escape_object($$restProps)
    ],
    {
      classes: "bx--list-box " + (size === "sm" ? "bx--list-box--sm" : "") + " " + (size === "xl" ? "bx--list-box--xl" : "") + " " + (type === "inline" ? "bx--list-box--inline" : "") + " " + (disabled ? "bx--list-box--disabled" : "") + " " + (open ? "bx--list-box--expanded" : "") + " " + (light ? "bx--list-box--light" : "") + " " + (!invalid && warn ? "bx--list-box--warning" : "")
    }
  )}>${slots.default ? slots.default({}) : ``}</div>
${invalid ? `<div${add_classes("bx--form-requirement".trim())}>${escape(invalidText)}</div>` : ``}
${!invalid && warn ? `<div${add_classes("bx--form-requirement".trim())}>${escape(warnText)}</div>` : ``}`;
});
const ListBox$1 = ListBox;
const ListBoxMenu = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let $$restProps = compute_rest_props($$props, ["id", "ref"]);
  let { id = "ccs-" + Math.random().toString(36) } = $$props;
  let { ref = null } = $$props;
  if ($$props.id === void 0 && $$bindings.id && id !== void 0)
    $$bindings.id(id);
  if ($$props.ref === void 0 && $$bindings.ref && ref !== void 0)
    $$bindings.ref(ref);
  return `<div${spread(
    [
      { role: "listbox" },
      { id: "menu-" + escape(id, true) },
      escape_object($$restProps)
    ],
    {
      classes: "bx--list-box__menu"
    }
  )}${add_attribute("this", ref, 0)}>${slots.default ? slots.default({}) : ``}</div>`;
});
const ListBoxMenu$1 = ListBoxMenu;
const ChevronDown = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let labelled;
  let attributes;
  let $$restProps = compute_rest_props($$props, ["size", "title"]);
  let { size = 16 } = $$props;
  let { title = void 0 } = $$props;
  if ($$props.size === void 0 && $$bindings.size && size !== void 0)
    $$bindings.size(size);
  if ($$props.title === void 0 && $$bindings.title && title !== void 0)
    $$bindings.title(title);
  labelled = $$props["aria-label"] || $$props["aria-labelledby"] || title;
  attributes = {
    "aria-hidden": labelled ? void 0 : true,
    role: labelled ? "img" : void 0,
    focusable: Number($$props["tabindex"]) === 0 ? true : void 0
  };
  return `<svg${spread(
    [
      { xmlns: "http://www.w3.org/2000/svg" },
      { viewBox: "0 0 32 32" },
      { fill: "currentColor" },
      { preserveAspectRatio: "xMidYMid meet" },
      { width: escape_attribute_value(size) },
      { height: escape_attribute_value(size) },
      escape_object(attributes),
      escape_object($$restProps)
    ],
    {}
  )}>${title ? `<title>${escape(title)}</title>` : ``}<path d="${"M16 22L6 12 7.4 10.6 16 19.2 24.6 10.6 26 12z"}"></path></svg>`;
});
const ChevronDown$1 = ChevronDown;
const ListBoxMenuIcon = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let translationId;
  let description;
  let $$restProps = compute_rest_props($$props, ["open", "translationIds", "translateWithId"]);
  let { open = false } = $$props;
  const translationIds = { close: "close", open: "open" };
  let { translateWithId = (id) => defaultTranslations[id] } = $$props;
  const defaultTranslations = {
    [translationIds.close]: "Close menu",
    [translationIds.open]: "Open menu"
  };
  if ($$props.open === void 0 && $$bindings.open && open !== void 0)
    $$bindings.open(open);
  if ($$props.translationIds === void 0 && $$bindings.translationIds && translationIds !== void 0)
    $$bindings.translationIds(translationIds);
  if ($$props.translateWithId === void 0 && $$bindings.translateWithId && translateWithId !== void 0)
    $$bindings.translateWithId(translateWithId);
  translationId = open ? translationIds.close : translationIds.open;
  description = translateWithId?.(translationId) ?? defaultTranslations[translationId];
  return `<div${spread([escape_object($$restProps)], {
    classes: "bx--list-box__menu-icon " + (open ? "bx--list-box__menu-icon--open" : "")
  })}>${validate_component(ChevronDown$1, "ChevronDown").$$render(
    $$result,
    {
      "aria-label": description,
      title: description
    },
    {},
    {}
  )}</div>`;
});
const ListBoxMenuIcon$1 = ListBoxMenuIcon;
const ListBoxMenuItem = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let isTruncated;
  let title;
  let $$restProps = compute_rest_props($$props, ["active", "highlighted", "disabled"]);
  let { active = false } = $$props;
  let { highlighted = false } = $$props;
  let { disabled = false } = $$props;
  let ref = null;
  if ($$props.active === void 0 && $$bindings.active && active !== void 0)
    $$bindings.active(active);
  if ($$props.highlighted === void 0 && $$bindings.highlighted && highlighted !== void 0)
    $$bindings.highlighted(highlighted);
  if ($$props.disabled === void 0 && $$bindings.disabled && disabled !== void 0)
    $$bindings.disabled(disabled);
  isTruncated = ref?.offsetWidth < ref?.scrollWidth;
  title = isTruncated ? ref?.innerText : void 0;
  {
    if (highlighted && ref && !ref.matches(":hover")) {
      ref.scrollIntoView({ block: "nearest" });
    }
  }
  return `<div${spread(
    [
      { role: "option" },
      {
        "aria-selected": escape_attribute_value(active)
      },
      {
        disabled: (disabled ? true : void 0) || null
      },
      escape_object($$restProps)
    ],
    {
      classes: "bx--list-box__menu-item " + (active ? "bx--list-box__menu-item--active" : "") + " " + (highlighted || active ? "bx--list-box__menu-item--highlighted" : "")
    }
  )}><div${add_attribute("title", title, 0)}${add_classes("bx--list-box__menu-item__option".trim())}${add_attribute("this", ref, 0)}>${slots.default ? slots.default({}) : ``}</div></div>`;
});
const ListBoxMenuItem$1 = ListBoxMenuItem;
const Close = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let labelled;
  let attributes;
  let $$restProps = compute_rest_props($$props, ["size", "title"]);
  let { size = 16 } = $$props;
  let { title = void 0 } = $$props;
  if ($$props.size === void 0 && $$bindings.size && size !== void 0)
    $$bindings.size(size);
  if ($$props.title === void 0 && $$bindings.title && title !== void 0)
    $$bindings.title(title);
  labelled = $$props["aria-label"] || $$props["aria-labelledby"] || title;
  attributes = {
    "aria-hidden": labelled ? void 0 : true,
    role: labelled ? "img" : void 0,
    focusable: Number($$props["tabindex"]) === 0 ? true : void 0
  };
  return `<svg${spread(
    [
      { xmlns: "http://www.w3.org/2000/svg" },
      { viewBox: "0 0 32 32" },
      { fill: "currentColor" },
      { preserveAspectRatio: "xMidYMid meet" },
      { width: escape_attribute_value(size) },
      { height: escape_attribute_value(size) },
      escape_object(attributes),
      escape_object($$restProps)
    ],
    {}
  )}>${title ? `<title>${escape(title)}</title>` : ``}<path d="${"M24 9.4L22.6 8 16 14.6 9.4 8 8 9.4 14.6 16 8 22.6 9.4 24 16 17.4 22.6 24 24 22.6 17.4 16 24 9.4z"}"></path></svg>`;
});
const Close$1 = Close;
const IconSearch = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let labelled;
  let attributes;
  let $$restProps = compute_rest_props($$props, ["size", "title"]);
  let { size = 16 } = $$props;
  let { title = void 0 } = $$props;
  if ($$props.size === void 0 && $$bindings.size && size !== void 0)
    $$bindings.size(size);
  if ($$props.title === void 0 && $$bindings.title && title !== void 0)
    $$bindings.title(title);
  labelled = $$props["aria-label"] || $$props["aria-labelledby"] || title;
  attributes = {
    "aria-hidden": labelled ? void 0 : true,
    role: labelled ? "img" : void 0,
    focusable: Number($$props["tabindex"]) === 0 ? true : void 0
  };
  return `<svg${spread(
    [
      { xmlns: "http://www.w3.org/2000/svg" },
      { viewBox: "0 0 32 32" },
      { fill: "currentColor" },
      { preserveAspectRatio: "xMidYMid meet" },
      { width: escape_attribute_value(size) },
      { height: escape_attribute_value(size) },
      escape_object(attributes),
      escape_object($$restProps)
    ],
    {}
  )}>${title ? `<title>${escape(title)}</title>` : ``}<path d="${"M29,27.5859l-7.5521-7.5521a11.0177,11.0177,0,1,0-1.4141,1.4141L27.5859,29ZM4,13a9,9,0,1,1,9,9A9.01,9.01,0,0,1,4,13Z"}"></path></svg>`;
});
const IconSearch$1 = IconSearch;
const SearchSkeleton = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let $$restProps = compute_rest_props($$props, ["size"]);
  let { size = "xl" } = $$props;
  if ($$props.size === void 0 && $$bindings.size && size !== void 0)
    $$bindings.size(size);
  return `
<div${spread([escape_object($$restProps)], {
    classes: "bx--skeleton " + (size === "sm" ? "bx--search--sm" : "") + " " + (size === "lg" ? "bx--search--lg" : "") + " " + (size === "xl" ? "bx--search--xl" : "")
  })}><span${add_classes("bx--label".trim())}></span>
  <div${add_classes("bx--search-input".trim())}></div></div>`;
});
const SearchSkeleton$1 = SearchSkeleton;
const Search = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let $$restProps = compute_rest_props($$props, [
    "value",
    "size",
    "searchClass",
    "skeleton",
    "light",
    "disabled",
    "expandable",
    "expanded",
    "placeholder",
    "autocomplete",
    "autofocus",
    "closeButtonLabelText",
    "labelText",
    "icon",
    "id",
    "ref"
  ]);
  let { value = "" } = $$props;
  let { size = "xl" } = $$props;
  let { searchClass = "" } = $$props;
  let { skeleton = false } = $$props;
  let { light = false } = $$props;
  let { disabled = false } = $$props;
  let { expandable = false } = $$props;
  let { expanded = false } = $$props;
  let { placeholder = "Search..." } = $$props;
  let { autocomplete = "off" } = $$props;
  let { autofocus = false } = $$props;
  let { closeButtonLabelText = "Clear search input" } = $$props;
  let { labelText = "" } = $$props;
  let { icon = IconSearch$1 } = $$props;
  let { id = "ccs-" + Math.random().toString(36) } = $$props;
  let { ref = null } = $$props;
  const dispatch = createEventDispatcher();
  let searchRef = null;
  if ($$props.value === void 0 && $$bindings.value && value !== void 0)
    $$bindings.value(value);
  if ($$props.size === void 0 && $$bindings.size && size !== void 0)
    $$bindings.size(size);
  if ($$props.searchClass === void 0 && $$bindings.searchClass && searchClass !== void 0)
    $$bindings.searchClass(searchClass);
  if ($$props.skeleton === void 0 && $$bindings.skeleton && skeleton !== void 0)
    $$bindings.skeleton(skeleton);
  if ($$props.light === void 0 && $$bindings.light && light !== void 0)
    $$bindings.light(light);
  if ($$props.disabled === void 0 && $$bindings.disabled && disabled !== void 0)
    $$bindings.disabled(disabled);
  if ($$props.expandable === void 0 && $$bindings.expandable && expandable !== void 0)
    $$bindings.expandable(expandable);
  if ($$props.expanded === void 0 && $$bindings.expanded && expanded !== void 0)
    $$bindings.expanded(expanded);
  if ($$props.placeholder === void 0 && $$bindings.placeholder && placeholder !== void 0)
    $$bindings.placeholder(placeholder);
  if ($$props.autocomplete === void 0 && $$bindings.autocomplete && autocomplete !== void 0)
    $$bindings.autocomplete(autocomplete);
  if ($$props.autofocus === void 0 && $$bindings.autofocus && autofocus !== void 0)
    $$bindings.autofocus(autofocus);
  if ($$props.closeButtonLabelText === void 0 && $$bindings.closeButtonLabelText && closeButtonLabelText !== void 0)
    $$bindings.closeButtonLabelText(closeButtonLabelText);
  if ($$props.labelText === void 0 && $$bindings.labelText && labelText !== void 0)
    $$bindings.labelText(labelText);
  if ($$props.icon === void 0 && $$bindings.icon && icon !== void 0)
    $$bindings.icon(icon);
  if ($$props.id === void 0 && $$bindings.id && id !== void 0)
    $$bindings.id(id);
  if ($$props.ref === void 0 && $$bindings.ref && ref !== void 0)
    $$bindings.ref(ref);
  {
    if (expanded && ref)
      ref.focus();
  }
  {
    dispatch(expanded ? "expand" : "collapse");
  }
  return `${skeleton ? `${validate_component(SearchSkeleton$1, "SearchSkeleton").$$render($$result, Object.assign({ size }, $$restProps), {}, {})}` : `<div role="${"search"}" aria-labelledby="${escape(id, true) + "-search"}" class="${[
    escape(searchClass, true),
    "bx--search " + (light ? "bx--search--light" : "") + " " + (disabled ? "bx--search--disabled" : "") + " " + (size === "sm" ? "bx--search--sm" : "") + " " + (size === "lg" ? "bx--search--lg" : "") + " " + (size === "xl" ? "bx--search--xl" : "") + " " + (expandable ? "bx--search--expandable" : "") + " " + (expanded ? "bx--search--expanded" : "")
  ].join(" ").trim()}">
    <div${add_classes("bx--search-magnifier".trim())}${add_attribute("this", searchRef, 0)}>${validate_component(icon || missing_component, "svelte:component").$$render($$result, { class: "bx--search-magnifier-icon" }, {}, {})}</div>
    <label id="${escape(id, true) + "-search"}"${add_attribute("for", id, 0)}${add_classes("bx--label".trim())}>${slots.labelText ? slots.labelText({}) : `
        ${escape(labelText)}
      `}</label>
    
    <input${spread(
    [
      { type: "text" },
      { role: "searchbox" },
      {
        autofocus: (autofocus === true ? true : void 0) || null
      },
      {
        autocomplete: escape_attribute_value(autocomplete)
      },
      { disabled: disabled || null },
      { id: escape_attribute_value(id) },
      {
        placeholder: escape_attribute_value(placeholder)
      },
      escape_object($$restProps)
    ],
    { classes: "bx--search-input" }
  )}${add_attribute("this", ref, 0)}${add_attribute("value", value, 0)}>
    <button type="${"button"}"${add_attribute("aria-label", closeButtonLabelText, 0)} ${disabled ? "disabled" : ""}${add_classes(("bx--search-close " + (value === "" ? "bx--search-close--hidden" : "")).trim())}>${validate_component(Close$1 || missing_component, "svelte:component").$$render($$result, { size: size === "xl" ? 20 : 16 }, {}, {})}</button></div>`}`;
});
const Search$1 = Search;
const Dropdown = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let inline;
  let selectedItem;
  let $$restProps = compute_rest_props($$props, [
    "items",
    "itemToString",
    "selectedId",
    "type",
    "direction",
    "size",
    "open",
    "light",
    "disabled",
    "titleText",
    "invalid",
    "invalidText",
    "warn",
    "warnText",
    "helperText",
    "label",
    "hideLabel",
    "translateWithId",
    "id",
    "name",
    "ref"
  ]);
  let { items = [] } = $$props;
  let { itemToString = (item) => item.text || item.id } = $$props;
  let { selectedId } = $$props;
  let { type = "default" } = $$props;
  let { direction = "bottom" } = $$props;
  let { size = void 0 } = $$props;
  let { open = false } = $$props;
  let { light = false } = $$props;
  let { disabled = false } = $$props;
  let { titleText = "" } = $$props;
  let { invalid = false } = $$props;
  let { invalidText = "" } = $$props;
  let { warn = false } = $$props;
  let { warnText = "" } = $$props;
  let { helperText = "" } = $$props;
  let { label = void 0 } = $$props;
  let { hideLabel = false } = $$props;
  let { translateWithId = void 0 } = $$props;
  let { id = "ccs-" + Math.random().toString(36) } = $$props;
  let { name = void 0 } = $$props;
  let { ref = null } = $$props;
  createEventDispatcher();
  let highlightedIndex = -1;
  if ($$props.items === void 0 && $$bindings.items && items !== void 0)
    $$bindings.items(items);
  if ($$props.itemToString === void 0 && $$bindings.itemToString && itemToString !== void 0)
    $$bindings.itemToString(itemToString);
  if ($$props.selectedId === void 0 && $$bindings.selectedId && selectedId !== void 0)
    $$bindings.selectedId(selectedId);
  if ($$props.type === void 0 && $$bindings.type && type !== void 0)
    $$bindings.type(type);
  if ($$props.direction === void 0 && $$bindings.direction && direction !== void 0)
    $$bindings.direction(direction);
  if ($$props.size === void 0 && $$bindings.size && size !== void 0)
    $$bindings.size(size);
  if ($$props.open === void 0 && $$bindings.open && open !== void 0)
    $$bindings.open(open);
  if ($$props.light === void 0 && $$bindings.light && light !== void 0)
    $$bindings.light(light);
  if ($$props.disabled === void 0 && $$bindings.disabled && disabled !== void 0)
    $$bindings.disabled(disabled);
  if ($$props.titleText === void 0 && $$bindings.titleText && titleText !== void 0)
    $$bindings.titleText(titleText);
  if ($$props.invalid === void 0 && $$bindings.invalid && invalid !== void 0)
    $$bindings.invalid(invalid);
  if ($$props.invalidText === void 0 && $$bindings.invalidText && invalidText !== void 0)
    $$bindings.invalidText(invalidText);
  if ($$props.warn === void 0 && $$bindings.warn && warn !== void 0)
    $$bindings.warn(warn);
  if ($$props.warnText === void 0 && $$bindings.warnText && warnText !== void 0)
    $$bindings.warnText(warnText);
  if ($$props.helperText === void 0 && $$bindings.helperText && helperText !== void 0)
    $$bindings.helperText(helperText);
  if ($$props.label === void 0 && $$bindings.label && label !== void 0)
    $$bindings.label(label);
  if ($$props.hideLabel === void 0 && $$bindings.hideLabel && hideLabel !== void 0)
    $$bindings.hideLabel(hideLabel);
  if ($$props.translateWithId === void 0 && $$bindings.translateWithId && translateWithId !== void 0)
    $$bindings.translateWithId(translateWithId);
  if ($$props.id === void 0 && $$bindings.id && id !== void 0)
    $$bindings.id(id);
  if ($$props.name === void 0 && $$bindings.name && name !== void 0)
    $$bindings.name(name);
  if ($$props.ref === void 0 && $$bindings.ref && ref !== void 0)
    $$bindings.ref(ref);
  inline = type === "inline";
  selectedItem = items.find((item) => item.id === selectedId);
  {
    if (!open) {
      highlightedIndex = -1;
    }
  }
  return `

<div${spread([escape_object($$restProps)], {
    classes: "bx--dropdown__wrapper bx--list-box__wrapper " + (inline ? "bx--dropdown__wrapper--inline" : "") + " " + (inline ? "bx--list-box__wrapper--inline" : "") + " " + (inline && invalid ? "bx--dropdown__wrapper--inline--invalid" : "")
  })}>${titleText ? `<label${add_attribute("for", id, 0)}${add_classes(("bx--label " + (disabled ? "bx--label--disabled" : "") + " " + (hideLabel ? "bx--visually-hidden" : "")).trim())}>${escape(titleText)}</label>` : ``}
  ${validate_component(ListBox$1, "ListBox").$$render(
    $$result,
    {
      role: void 0,
      type,
      size,
      name,
      "aria-label": $$props["aria-label"],
      class: "bx--dropdown " + (direction === "top" && "bx--list-box--up") + " " + (invalid && "bx--dropdown--invalid") + " " + (!invalid && warn && "bx--dropdown--warning") + " " + (open && "bx--dropdown--open") + "\n      " + (size === "sm" && "bx--dropdown--sm") + "\n      " + (size === "xl" && "bx--dropdown--xl") + "\n      " + (inline && "bx--dropdown--inline") + "\n      " + (disabled && "bx--dropdown--disabled") + "\n      " + (light && "bx--dropdown--light"),
      disabled,
      open,
      invalid,
      invalidText,
      light,
      warn,
      warnText
    },
    {},
    {
      default: () => {
        return `${invalid ? `${validate_component(WarningFilled$1, "WarningFilled").$$render($$result, { class: "bx--list-box__invalid-icon" }, {}, {})}` : ``}
    ${!invalid && warn ? `${validate_component(WarningAltFilled$1, "WarningAltFilled").$$render(
          $$result,
          {
            class: "bx--list-box__invalid-icon bx--list-box__invalid-icon--warning"
          },
          {},
          {}
        )}` : ``}
    <button type="${"button"}" tabindex="${"0"}"${add_attribute("aria-expanded", open, 0)} ${disabled ? "disabled" : ""}${add_attribute("translatewithid", translateWithId, 0)}${add_attribute("id", id, 0)}${add_classes("bx--list-box__field".trim())}${add_attribute("this", ref, 0)}><span${add_classes("bx--list-box__label".trim())}>${selectedItem ? `${escape(itemToString(selectedItem))}` : `${escape(label)}`}</span>
      ${validate_component(ListBoxMenuIcon$1, "ListBoxMenuIcon").$$render($$result, { translateWithId, open }, {}, {})}</button>
    ${open ? `${validate_component(ListBoxMenu$1, "ListBoxMenu").$$render($$result, { "aria-labelledby": id, id }, {}, {
          default: () => {
            return `${each(items, (item, i) => {
              return `${validate_component(ListBoxMenuItem$1, "ListBoxMenuItem").$$render(
                $$result,
                {
                  id: item.id,
                  active: selectedId === item.id,
                  highlighted: highlightedIndex === i,
                  disabled: item.disabled
                },
                {},
                {
                  default: () => {
                    return `${slots.default ? slots.default({ item, index: i }) : `
              ${escape(itemToString(item))}
            `}
          `;
                  }
                }
              )}`;
            })}`;
          }
        })}` : ``}`;
      }
    }
  )}
  ${!inline && !invalid && !warn && helperText ? `<div${add_classes(("bx--form__helper-text " + (disabled ? "bx--form__helper-text--disabled" : "")).trim())}>${escape(helperText)}</div>` : ``}</div>`;
});
const Dropdown$1 = Dropdown;
const ProgressBar = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let indeterminate;
  let capped;
  let $$restProps = compute_rest_props($$props, ["value", "max", "kind", "size", "labelText", "hideLabel", "helperText", "id"]);
  let { value = void 0 } = $$props;
  let { max = 100 } = $$props;
  let { kind = "default" } = $$props;
  let { size = "md" } = $$props;
  let { labelText = "" } = $$props;
  let { hideLabel = false } = $$props;
  let { helperText = "" } = $$props;
  let { id = "ccs-" + Math.random().toString(36) } = $$props;
  let helperId = "ccs-" + Math.random().toString(36);
  if ($$props.value === void 0 && $$bindings.value && value !== void 0)
    $$bindings.value(value);
  if ($$props.max === void 0 && $$bindings.max && max !== void 0)
    $$bindings.max(max);
  if ($$props.kind === void 0 && $$bindings.kind && kind !== void 0)
    $$bindings.kind(kind);
  if ($$props.size === void 0 && $$bindings.size && size !== void 0)
    $$bindings.size(size);
  if ($$props.labelText === void 0 && $$bindings.labelText && labelText !== void 0)
    $$bindings.labelText(labelText);
  if ($$props.hideLabel === void 0 && $$bindings.hideLabel && hideLabel !== void 0)
    $$bindings.hideLabel(hideLabel);
  if ($$props.helperText === void 0 && $$bindings.helperText && helperText !== void 0)
    $$bindings.helperText(helperText);
  if ($$props.id === void 0 && $$bindings.id && id !== void 0)
    $$bindings.id(id);
  indeterminate = value === void 0;
  capped = value > max ? max : value < 0 ? 0 : value;
  return `<div${spread([escape_object($$restProps)], {
    classes: "bx--progress-bar " + (indeterminate ? "bx--progress-bar--indeterminate" : "") + " " + (size === "md" ? "bx--progress-bar--big" : "") + " " + (size === "sm" ? "bx--progress-bar--small" : "") + " " + (kind === "inline" ? "bx--progress-bar--inline" : "") + " " + (kind === "indented" ? "bx--progress-bar--indented" : "")
  })}><label${add_attribute("for", id, 0)}${add_classes(("bx--progress-bar__label " + (hideLabel ? "bx--visually-hidden" : "")).trim())}>${slots.labelText ? slots.labelText({}) : `
      ${escape(labelText)}
    `}</label>
  <div role="${"progressbar"}"${add_attribute("id", id, 0)}${add_attribute("aria-valuemin", indeterminate ? void 0 : 0, 0)}${add_attribute("aria-valuemax", indeterminate ? void 0 : max, 0)}${add_attribute("aria-valuenow", indeterminate ? void 0 : capped, 0)}${add_attribute("aria-describedby", helperText ? helperId : null, 0)}${add_classes("bx--progress-bar__track".trim())}><div style="${"transform: scaleX(" + escape(capped / max, true) + ")"}"${add_classes("bx--progress-bar__bar".trim())}></div></div>
  ${helperText ? `<div${add_attribute("id", helperId, 0)}${add_classes("bx--progress-bar__helper-text".trim())}>${escape(helperText)}</div>` : ``}</div>`;
});
const ProgressBar$1 = ProgressBar;
const Toggle = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let $$restProps = compute_rest_props($$props, [
    "size",
    "toggled",
    "disabled",
    "labelA",
    "labelB",
    "labelText",
    "hideLabel",
    "id",
    "name"
  ]);
  let { size = "default" } = $$props;
  let { toggled = false } = $$props;
  let { disabled = false } = $$props;
  let { labelA = "Off" } = $$props;
  let { labelB = "On" } = $$props;
  let { labelText = "" } = $$props;
  let { hideLabel = false } = $$props;
  let { id = "ccs-" + Math.random().toString(36) } = $$props;
  let { name = void 0 } = $$props;
  const dispatch = createEventDispatcher();
  if ($$props.size === void 0 && $$bindings.size && size !== void 0)
    $$bindings.size(size);
  if ($$props.toggled === void 0 && $$bindings.toggled && toggled !== void 0)
    $$bindings.toggled(toggled);
  if ($$props.disabled === void 0 && $$bindings.disabled && disabled !== void 0)
    $$bindings.disabled(disabled);
  if ($$props.labelA === void 0 && $$bindings.labelA && labelA !== void 0)
    $$bindings.labelA(labelA);
  if ($$props.labelB === void 0 && $$bindings.labelB && labelB !== void 0)
    $$bindings.labelB(labelB);
  if ($$props.labelText === void 0 && $$bindings.labelText && labelText !== void 0)
    $$bindings.labelText(labelText);
  if ($$props.hideLabel === void 0 && $$bindings.hideLabel && hideLabel !== void 0)
    $$bindings.hideLabel(hideLabel);
  if ($$props.id === void 0 && $$bindings.id && id !== void 0)
    $$bindings.id(id);
  if ($$props.name === void 0 && $$bindings.name && name !== void 0)
    $$bindings.name(name);
  {
    dispatch("toggle", { toggled });
  }
  return `
<div${spread(
    [
      escape_object($$restProps),
      {
        style: escape($$restProps["style"], true) + "; user-select: none"
      }
    ],
    { classes: "bx--form-item" }
  )}>
  <input role="${"switch"}" type="${"checkbox"}" ${toggled ? "checked" : ""} ${disabled ? "disabled" : ""}${add_attribute("id", id, 0)}${add_attribute("name", name, 0)}${add_classes(("bx--toggle-input " + (size === "sm" ? "bx--toggle-input--small" : "")).trim())}>
  <label${add_attribute(
    "aria-label",
    labelText ? void 0 : $$props["aria-label"] || "Toggle",
    0
  )}${add_attribute("for", id, 0)}${add_classes("bx--toggle-input__label".trim())}><span${add_classes((hideLabel ? "bx--visually-hidden" : "").trim())}>${slots.labelText ? slots.labelText({}) : `
        ${escape(labelText)}
      `}</span>
    <span${add_attribute("style", hideLabel && "margin-top: 0", 0)}${add_classes("bx--toggle__switch".trim())}><span aria-hidden="${"true"}"${add_classes("bx--toggle__text--off".trim())}>${slots.labelA ? slots.labelA({}) : `
          ${escape(labelA)}
        `}</span>
      <span aria-hidden="${"true"}"${add_classes("bx--toggle__text--on".trim())}>${slots.labelB ? slots.labelB({}) : `
          ${escape(labelB)}
        `}</span></span></label></div>`;
});
const Toggle$1 = Toggle;
const Categories_svelte_svelte_type_style_lang = "";
const css$1 = {
  code: "span.svelte-4x0p5{opacity:0;float:right}.lk.svelte-4x0p5{padding:1px;padding-top:4px;margin-top:2px\n}.loading .bx--progress-bar__bar{opacity:0.8;animation:svelte-4x0p5-blinker 4s linear infinite}.loading span{opacity:1;color:rgb(255, 255, 255);font-size:medium;animation:svelte-4x0p5-blinker 4s linear infinite}@keyframes svelte-4x0p5-blinker{50%{opacity:0.4}}",
  map: null
};
async function bcupdate(colour) {
  if (colour) {
    colour.forEach((c, i) => {
      try {
        document.querySelector(`#cat_${i} div.bx--progress-bar__bar`).style["background-color"] = c;
      } catch (err) {
      }
    });
  }
}
const Categories = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let { csum } = $$props;
  let { keys = [] } = $$props;
  let { colour } = $$props;
  let { colourbase } = $$props;
  function reset_colour(i) {
    colour[i] = colourbase[i];
  }
  if ($$props.csum === void 0 && $$bindings.csum && csum !== void 0)
    $$bindings.csum(csum);
  if ($$props.keys === void 0 && $$bindings.keys && keys !== void 0)
    $$bindings.keys(keys);
  if ($$props.colour === void 0 && $$bindings.colour && colour !== void 0)
    $$bindings.colour(colour);
  if ($$props.colourbase === void 0 && $$bindings.colourbase && colourbase !== void 0)
    $$bindings.colourbase(colourbase);
  $$result.css.add(css$1);
  {
    {
      keys.forEach((d, i) => {
        reset_colour(i);
      });
    }
  }
  {
    bcupdate(colour);
  }
  return `${$$result.head += `<!-- HEAD_svelte-1l5f18d_START --><link rel="${"stylesheet"}" href="${"/coloris.min.css"}"><script src="${"/coloris.min.js"}"></script><!-- HEAD_svelte-1l5f18d_END -->`, ""}



<main><span class="${"svelte-4x0p5"}">::calculating::   </span>

${each(keys.map((d, i) => [i, d]), ([i, cat]) => {
    return `<div class="${"lk svelte-4x0p5"}">
    ${validate_component(ProgressBar$1, "ProgressBar").$$render(
      $$result,
      {
        value: 1 + csum[i],
        labelText: cat,
        id: "cat_" + i,
        helperText: ""
      },
      {},
      {}
    )}

</div>`;
  })}

</main>`;
});
const _page_svelte_svelte_type_style_lang = "";
const css = {
  code: "body{margin:0;padding:0;font-family:'IBM Plex Sans', sans-serif;overflow:hidden;opacity:0;-moz-transition:opacity 3.5s;-webkit-transition:opacity 3.5s;-o-transition:opacity 3.5s;transition:opacity 3.5s}label.svelte-en5mmv{display:block;height:.35em}h1.svelte-en5mmv{font-size:large}#map{position:absolute;top:0;left:0;bottom:0;width:100%}.legend.svelte-en5mmv{z-index:99999999;position:absolute;display:block;backdrop-filter:blur(3px)saturate(0.1);padding:5px;background-color:#444;opacity:80%;border-radius:3%;margin:auto;bottom:4px;align-content:center;right:4px}#instruct.svelte-en5mmv{z-index:99999999;position:absolute;display:block;font-size:110%;backdrop-filter:blur(3px);border-radius:3%;padding:5px;bottom:4px;align-content:center;left:4px}.menu.svelte-en5mmv{z-index:99999999;position:absolute;display:block;backdrop-filter:blur(3px)saturate(0.1);padding:5px;background-color:#444;opacity:80%;border-radius:3%;margin:auto;top:4px;align-content:center;left:4px}",
  map: null
};
const Page = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  import("../../chunks/g100.js");
  let colourbase = ["ffbe0b", "fb5607", "ff006e", "8338ec", "3a86ff"].map((d) => "#" + d);
  let map;
  let colour;
  let csum = [100, 100, 100, 100, 100, 100];
  let update = false;
  let keytitle = "England + Wales ";
  let keys, tile;
  tile = "TS021_ethnic_group_tb_6a_2021";
  colour = [...colourbase];
  const names = [
    {
      id: "TS021_ethnic_group_tb_6a_2021",
      text: "Ethnicity"
    },
    {
      id: "TS002_legal_partnership_status_3a_2021",
      text: "Legal Partnership"
    },
    {
      id: "TS017_hh_size_5a_2021",
      text: "Household Size"
    },
    {
      id: "TS003_hh_family_composition_4a_2021",
      text: "Family Composition"
    }
  ];
  async function changetile(type) {
    if (!map)
      return 0;
    console.log("changetitle", type, map, map.getSource("dot-src"));
    const host = "https://onsvisual.github.io/";
    map.getSource("dot-src").setTiles([host + type + "/{z}/{x}/{y}.pbf?raw=true"]);
    switch (type) {
      case "TS002_legal_partnership_status_3a_2021":
        keys = [
          "Married or in a registered civil partnership",
          "Other marital or civil partnership status"
        ];
        csum = [81, 100];
        break;
      case "TS017_hh_size_5a_2021":
        keys = [
          "1 person in household",
          "2 people in household",
          "3 people in household",
          "4 or more people in household"
        ];
        csum = [88.09201633, 100, 46.60850951, 57.61101176];
        break;
      case "TS021_ethnic_group_tb_6a_2021":
        keys = [
          "Asian, Asian British or Asian Welsh",
          "Black, Black British, Black Welsh, Caribbean or African",
          "Mixed or Multiple ethnic groups",
          "White",
          "Other ethnic group"
        ];
        csum = [11.03618827, 4.7953314, 3.48013752, 100, 2.50895191];
        break;
      case "TS003_hh_family_composition_4a_2021":
        keys = [
          "Multiple family household",
          "One person household",
          "Single family household"
        ];
        csum = [10.69615599, 47.74876488, 100];
        break;
      default:
        keys = [
          "Asian, Asian British or Asian Welsh",
          "Black, Black British, Black Welsh, Caribbean or African",
          "Mixed or Multiple ethnic groups",
          "White",
          "Other ethnic group"
        ];
        csum = [11.03618827, 4.7953314, 3.48013752, 100, 2.50895191];
        break;
    }
    newpaint();
  }
  function newpaint() {
    map.setPaintProperty("dot-data", "circle-color", [
      "match",
      ["get", "cat"],
      0,
      colour[0],
      1,
      colour[1],
      2,
      colour[2],
      3,
      colour[3],
      4,
      colour[4],
      "#ccc"
    ]);
  }
  $$result.css.add(css);
  let $$settled;
  let $$rendered;
  do {
    $$settled = true;
    {
      changetile(tile);
    }
    {
      try {
        newpaint(colour);
      } catch (err) {
      }
    }
    $$rendered = `${validate_component(MapComponent, "MapComponent").$$render(
      $$result,
      { map },
      {
        map: ($$value) => {
          map = $$value;
          $$settled = false;
        }
      },
      {}
    )}




<div class="${"menu svelte-en5mmv"}"><h1 class="${"svelte-en5mmv"}">Census Dot Density Map</h1>

<label style="${"float:left;font-size:small!important;margin-top:1.25em"}" class="${"svelte-en5mmv"}">Use page avarage: </label> 
${validate_component(Toggle$1, "Toggle").$$render(
      $$result,
      {
        size: "sm",
        style: "float:right;margin-right:30px",
        toggled: update
      },
      {
        toggled: ($$value) => {
          update = $$value;
          $$settled = false;
        }
      },
      {}
    )}
<br>
<br><br>
<br>
<label class="${"svelte-en5mmv"}">Select Table </label>
<br>
${validate_component(Dropdown$1, "Dropdown").$$render(
      $$result,
      { items: names, selectedId: tile },
      {
        selectedId: ($$value) => {
          tile = $$value;
          $$settled = false;
        }
      },
      {}
    )}
<br>
<label class="${"svelte-en5mmv"}">Find Postcode </label>
<br>
${validate_component(Search$1, "Search").$$render($$result, { size: "sm" }, {}, {})}

  <label style="${"display:block;padding-top:2px;padding-bottom:1em;"}" class="${"svelte-en5mmv"}">1 dot = <span id="${"people"}"></span> people</label></div>


<a id="${"instruct"}" href="${"https://scribehow.com/shared/Prototype_Dot_Density_Map__yreqzD5ISB6EQr2IU9FWbg"}" class="${"svelte-en5mmv"}">Usage Instructions. </a>



<div class="${"legend svelte-en5mmv"}"><label style="${"float:right;text-decoration: underline;margin:auto"}" class="${"svelte-en5mmv"}">${escape(!update ? keytitle : "Page Avarage")}</label> <br>
    ${validate_component(Categories, "Categories").$$render(
      $$result,
      { keys, colourbase, csum, colour },
      {
        colour: ($$value) => {
          colour = $$value;
          $$settled = false;
        }
      },
      {}
    )}</div>


  
  <link rel="${"preconnect"}" href="${"https://fonts.googleapis.com"}">
  <link rel="${"preconnect"}" href="${"https://fonts.gstatic.com"}" crossorigin>
  <link href="${"https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:wght@100&display=swap"}" rel="${"stylesheet"}">`;
  } while (!$$settled);
  return $$rendered;
});
export {
  Page as default
};
