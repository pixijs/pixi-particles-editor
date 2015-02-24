(function(){

if (APP)
{

	// Import node modules
	var gui = require('nw.gui'),
		SubMenu = gui.Menu,
		Window = gui.Window,
		MenuItem = gui.MenuItem,
		isOSX = process.platform === 'darwin';
	
	/**
	*  Application-only system menu
	*  @class Menu
	*/
	var Menu = function()
	{
		var main = Window.get();

		/**
		*  The root menu
		*  @property {gui.Menu} parent
		*/
		this.parent = new SubMenu({ type: 'menubar' });

		if (isOSX)
		{
			// Create the build in mac menubar
			// this needs to happen BEFORE assigning the menu
			this.parent.createMacBuiltin("PixiParticlesEditor", {
				hideEdit: false,
				hideWindow: true
			});
		}

		// Add menu access to dev tools
		if (DEBUG)
		{
			// mac already has the windows menu
			if (isOSX)
			{
				var items = this.parent.items;
				this.winMenu = items[items.length - 1].submenu;
				this.addSeparator(this.winMenu);
			}
			else
			{
				this.winMenu = new SubMenu();
				this.parent.append(new MenuItem({
					label: 'Window',
					submenu: this.winMenu
				}));
			}

			// Add menu access for the dev console
			this.addItem({
				label: "Show Developer Tools",
				key: "j",
				modifiers: "cmd-alt",
				click: function()
				{
					main.showDevTools();
				}
			}, this.winMenu);
		}

		// Assign the new menu to the window
		main.menu = this.parent;
	};

	var p = Menu.prototype;

	/**
	*  Add a new item to a menu
	*  @method addItem
	*  @param {object} settings MenuItem settings
	*  @param {MenuItem} submenu The Menu to add the item to
	*/
	p.addItem = function(settings, submenu)
	{
		var item = new MenuItem(settings);
		submenu.append(item);
		return item;
	};

	/**
	*  Add a new separator to a menu
	*  @method addSeparator
	*  @param {object} settings MenuItem settings
	*  @param {MenuItem} submenu The Menu to add the separator to
	*/
	p.addSeparator = function(submenu)
	{
		submenu.append(new MenuItem({
			type: 'separator'
		}));
	};

	// Assign to namespace
	namespace('pixiparticles').Menu = Menu;
}

}());