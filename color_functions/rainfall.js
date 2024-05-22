// TODO

// big idea: falling raindrops fill up a fluid simulation at the bottom of the screen, until it is totally full.

// each cell has a fluid density between 0 and 1, and a velocity
// there should be a constant downward force across the whole volume, this will lead to gravity,
// and cause the raindrops to fall

// fluid advects according to its velocity
// velocity is updated by the forces acting upon the fluid
// incompressible: when density would increase above 1, instead, we solve
