#######################################################################################################################

SET FOREIGN_KEY_CHECKS = 0;

#######################################################################################################################
# Config:

INSERT INTO `config` (`scope`, `path`, `value`, `type`) VALUES ('client', 'ui/controls/tabTarget', '1', 'b');
INSERT INTO `config` (`scope`, `path`, `value`, `type`) VALUES ('client', 'ui/controls/disableContextMenu', '1', 'b');
INSERT INTO `config` (`scope`, `path`, `value`, `type`) VALUES ('client', 'ui/controls/primaryMove', '1', 'b');

# Skills level up animations:

CREATE TABLE `skills_class_level_up_animations` (
	`id` INT(10) UNSIGNED NOT NULL AUTO_INCREMENT,
	`class_path_id` INT(10) UNSIGNED NULL DEFAULT NULL,
	`level_id` INT(10) UNSIGNED NULL DEFAULT NULL,
	`animationData` TEXT NOT NULL COLLATE 'utf8_unicode_ci',
	PRIMARY KEY (`id`) USING BTREE,
	UNIQUE INDEX `class_path_id_level_id` (`class_path_id`, `level_id`) USING BTREE,
	INDEX `FK_skills_class_level_up_skills_levels` (`level_id`) USING BTREE,
	CONSTRAINT `FK_skills_class_level_up_skills_class_path` FOREIGN KEY (`class_path_id`) REFERENCES `skills_class_path` (`id`) ON UPDATE CASCADE ON DELETE RESTRICT,
	CONSTRAINT `FK_skills_class_level_up_skills_levels` FOREIGN KEY (`level_id`) REFERENCES `skills_levels` (`id`) ON UPDATE CASCADE ON DELETE RESTRICT
) COLLATE='utf8_unicode_ci' ENGINE=InnoDB;

# Single level up for all classes and levels:
INSERT INTO `skills_class_level_up_animations` (`animationData`) VALUES ('{"enabled":true,"type":"spritesheet","img":"heal_cast","frameWidth":64,"frameHeight":70,"start":0,"end":3,"repeat":-1,"destroyTime":2000}');

#######################################################################################################################

SET FOREIGN_KEY_CHECKS = 1;

#######################################################################################################################