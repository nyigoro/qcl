start = "<qcl>" _ components:component* _ "</qcl>" { return components; }

component = "<component" _ "name=\"" name:[a-zA-Z]+ "\"" _ attrs:attribute* ">" _ content:content "</component>" { return { type: 'component', name, attrs, content }; }

attribute = name:[a-zA-Z:]+ "=" value:quoted_string { return { name: name.join(""), value }; }

content = (markup / style / script)*

markup = "<markup>" _ content:(tag / text / binding / each / import)* "</markup>" { return { type: 'markup', content }; }

style = "<style>" _ content:[^<]* "</style>" { return { type: 'style', content: content.join("") }; }

script = "<script>" _ content:[^<]* "</script>" { return { type: 'script', content: content.join("") }; }

tag = "<" tagName:[a-zA-Z]+ attrs:attribute* ">" content:(tag / text / binding)* "</" endTag:[a-zA-Z]+ ">" { return { type: 'tag', tagName: tagName.join(""), attrs, content }; }

text = content:[^{}<]+ { return { type: 'text', content: content.join("") }; }

binding = "{" name:[a-zA-Z.]+ "}" { return { type: 'binding', name: name.join("") }; }

each = "<each" _ item:[a-zA-Z]+ _ "in" _ collection:[a-zA-Z.]+ ">" _ content:(tag / text / binding)* "</each>" { return { type: 'each', item: item.join(""), collection: collection.join(""), content }; }

import = "<import" _ "component=\"" component:[a-zA-Z]+ "\"" _ "from=\"" path:[^\"]+ "\" />" { return { type: 'import', component: component.join(""), path: path.join("") }; }

quoted_string = "\"" value:[^\"]* "\"" { return value.join(""); }

_ = [ \t\n\r]*
