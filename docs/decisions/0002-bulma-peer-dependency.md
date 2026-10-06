# ADR 0002: Bulma as a peer dependency

Status: accepted

## Context

The theme customises Bulma 1.x and must not ship its own copy.

## Decision

bulma ^1.0.4 is a peer dependency; the theme builds on Bulma's Sass and CSS variables.
