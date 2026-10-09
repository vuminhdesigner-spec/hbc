# Registry index (máy sinh — đừng sửa tay)

Nguồn: `ds`. Chạy lại: `node tools/registry_index.mjs`.
Đọc file này trước. Chỉ mở `ds/components/<tên>.md` của component thật sự cần dùng.

## Component

Dạng: `tên` · block · `--`modifier · `__`part · `+`class khác (block phụ, viết đủ) · Angular

- `anchor-nav` · `.anchor-nav` · __{item} · <ds-anchor-nav>
- `app-shell` · `.mdm-shell`
- `attachment-list` · `.attachment-list` · --{grid} · +{.attachment__select,.attachment__body,.attachment__name,.attachment__meta,.attachment__action,.attachment__error,.attachment__spinner}
- `attachment` · `.attachment-pane` · --{bare} · __{body,collapse,expand,file,footer,header,heading,icon,lead,page,pager,title}
- `avatar` · `.avatar` · --{2xl,lg,md,sm,xl,xs} · __{company,company-image,icon,image,status,status--online}
- `badge` · `.badge` · --{active,blue,brand,cancelled,error,gray,green,icon-left,inactive,lg,md,neutral,new,no-dot,paused,pending,sm,success,warning,yellow} · __{icon} · <ds-badge>
- `breadcrumbs` · `.breadcrumbs` · __{current,item,label-hidden,link,list,separator}
- `button-group` · `.button-group` · --{icon-only,md,sm,xl} · __{item,more,menu,menu-item,dot}
- `button` · `.button` · --{compact,destructive,ghost,link,link-gray,primary,secondary-color,secondary-destructive,tertiary} · __{spinner} · <ds-button>
- `data-table` · `.data-table` · --{attributes,clip,frozen-action,frozen-end,frozen-identity,hierarchy,listing,striped} · +{.file-chip--multi,.file-chip--sm,.table-panel--bare,.cell-action,.cell-badges,.cell-badges__text,.cell-empty,.cell-flag,.cell-input,.cell-lead,.cell-lead__icon,.cell-links,.cell-progress,.cell-progress__line,.cell-progress__text,.cell-select,.cell-text,.cell-tree,.cell-tree-cell--child,.cell-tree__branch,.cell-tree__marks,.file-chip,.file-chip__count,.file-chip__icon,.row-actions,.row-detail,.user-cell} · <ds-table>
- `data-viewer` · `.data-viewer` · __{label,value,value--empty} · +{.data-list--cols}
- `doc-detail` · `.doc-detail` · --{overlay} · __{header,header-left,close,minimize,identity,title,heading,title-input,title-error,folder,folder-row,folder-copy,folder-icon,folder-path,folder-segment,folder-segment--leaf,folder-collapsed,folder-sep,body,doc,preview,form-track,rail,form,missing}
- `dock` · `.dock` · __{close,expand,item,list,progress,restore,title}
- `drawer` · `.drawer` · --{fit,lg,md,sm} · __{body,close,expand,footer,header,header-actions,header-steps,heading,minimize,panel,scrim,status,status-action,supporting,title,title-name,toolbar} · <ds-drawer>
- `empty-state` · `.empty-block` · __{title,text} · +{.empty-illustration,.empty-page,.empty-page__text,.empty-page__title,.empty-page__supporting} · <ds-empty-state>
- `entity-row` · `.entity-row` · --{action} · __{body,logo,mark,meta,name}
- `featured-icon` · `.featured-icon` · --{error,info,lg,muted,neutral,ring,sm,success,warning,xl,xs} · <ds-featured-icon>
- `file-upload` · `.file-upload` · --{fill} · __{caption,dropzone,filename,hint,hint-action,input,line,line--gap,line--short,line--title,preview,prompt,sheet,status,swap,tile,trigger,unsupported,viewport} · <ds-upload>
- `filter-panel` · `.filter-panel` · __{footer,rows,scroll} · +{.filter-op-static}
- `folder-grid` · `.folder-grid` · +{.folder-card,.folder-card__figure,.folder-card__icon,.folder-card__icon--file,.folder-card__kind,.folder-card__name}
- `folder` · `.folder` · --{bare,compact} · __{col,expand,head,nav,title} · +{.folder-item,.folder-item__check,.folder-item__chevron,.folder-item__chevron--empty,.folder-item__icon,.folder-item__label,.folder-item__meta}
- `inform` · `.inform` · --{brand,error,success,warning} · __{actions,close,content,icon,supporting,text,title}
- `inputs` · `.form-field` · __{affix,control,control--area,control--disabled,control--error,control--readonly,dot,dot--success,error,hint,icon,label,status} · <ds-input>
- `listing-toolbar` · `.listing-toolbar` · --{wrap} · __{actions,group,icon-button,search}
- `metric-item` · `.metric-tile` · --{loading} · __{body,figures,icon,icon--info,icon--neutral,icon--success,icon--warning,label,menu,skeleton,value} · <ds-metric-tile>
- `modal` · `.modal` · __{actions,actions--between,actions--split,body,body--form,body--table,close,content,content--centered,controls,expand,heading,panel,panel--form,panel--horizontal,panel--md,panel--read,panel--sm,panel--table,scrim,status,status-action,supporting,text,title} · <ds-modal>
- `notification` · `.notification` · --{alert} · __{actions,body,close,description,text,title} · <ds-notification-stack>
- `page-header` · `.page-header` · --{docs} · __{avatar,back-icon,content,description,heading,identity,subtitle,title} · +{.page-sticky,.page-header-block,.page-header-block--padded}
- `page-tab` · `.page-tab` · __{close,icon,label} · +{.page-tab-group,.page-tab-group--transparent}
- `pagination` · `.pagination` · <ds-pagination>
- `progress-bar` · `.progress-bar` · __{fill}
- `progress-steps` · `.progress-steps` · --{text} · __{bar,body,item,label,marker,sep,state} · <ds-progress-steps>
- `resize-handle` · `.resize-handle`
- `section-card` · `.section-card` · --{form,full,wide} · +{.section-body}
- `section-header` · `.section-header` · __{bar,content,divider,lead,supporting,text,title} · +{.section-action,.section-more}
- `select` · `.select` · --{cell,open,querying} · __{chevron,clear,control,control--error,control--tags,dot,dot--success,empty,input,label,lead,menu,option,option-body,option-support,option-text,placeholder,support,tag,tag--more,tag-body,tag-remove,tag-text,tags,value} · <ds-select>
- `side-navigation` · `.side-nav` · +{.nav-collapse,.nav-group,.nav-item,.nav-module,.nav-module-block,.nav-pill,.nav-search,.side-profile}
- `snack-bar` · `.snack-bar` · --{light} · __{actions,cta,icon-button,icons,menu,menu-divider,menu-item,message} · +{.snack-bar-region--anchored,.snack-bar-region--inline,.snack-bar-region}
- `tab-bar` · `.tabs` · --{transparent,overflow} · +{.tab} · <ds-tab>
- `toggle` · `.toggle` · <ds-switch>
- `tooltip` · `.tooltip` · --{bottom,end,start} · __{arrow,text} · <ds-tooltip-bubble>

## Pattern (bố cục trang)

- `filter` = empty-state + filter-panel + inputs + metric-item · mẫu: screens/du-an/ho-so/danh-sach.html
- `item-detail` = anchor-nav + app-shell + attachment-list + data-viewer + drawer + empty-state + entity-row + featured-icon + folder + inform + metric-item + page-header + section-card + section-header + side-navigation + tab-bar · mẫu: screens/doi-tac/chi-tiet.html
- `item-listing` = app-shell + dashboard-kpi + data-table + filter-panel + folder + listing-toolbar + metric-item + page-header + page-tab + pagination + resize-handle + side-navigation + tab-bar · mẫu: screens/du-an/danh-sach.html
- `wizard-drawer` = drawer + progress-steps + featured-icon + dock + modal + notification + button + inputs + select + section-header + data-table · mẫu: screens/doi-tac/danh-sach.html

## Token semantic (tên, bỏ tiền tố)

- `--utui-color-bg-*`: page page-alt surface surface-subtle surface-muted surface-hover surface-active surface-disabled table-header brand brand-hover brand-active brand-subtle success-subtle info-subtle warning-subtle error-subtle
- `--utui-color-text-*`: primary secondary tertiary placeholder disabled inverse brand link success info warning error
- `--utui-color-border-*`: default subtle strong brand brand-subtle focus error
- `--utui-color-icon-*`: default muted strong brand inverse success info warning error
- `--utui-type-page-*`: title-size title-line title-weight
- `--utui-type-section-*`: title-size title-line title-weight
- `--utui-type-body-*`: size line weight
- `--utui-type-label-*`: size line weight
- `--utui-type-caption-*`: size line

Primitive (spacing/radius/shadow/font) và component token: xem `ds/tokens/`. Không dùng giá trị viết cứng.
