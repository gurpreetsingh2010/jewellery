package com.defysope.controller;

import org.springframework.stereotype.Controller;
import org.springframework.ui.ModelMap;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.servlet.ModelAndView;

@Controller
public class AddPurchaseController {

	@RequestMapping(value = "/addPurchase", method = RequestMethod.GET)
	public ModelAndView index(@ModelAttribute("model") ModelMap model) {

		return new ModelAndView("addPurchase", model);
	}
}
