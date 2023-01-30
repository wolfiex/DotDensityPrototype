
! f2py -c tilefunctions.f90 -m customtiles




! FUNCTION get_lat_lng(z,x,y)
!       IMPLICIT NONE
!       INTEGER, INTENT(IN) :: z
!       INTEGER, INTENT(IN) :: x
!       INTEGER, INTENT(IN) :: y
!       REAL, INTENT(OUT) :: lat
!       REAL, INTENT(OUT) :: lng
!       DOUBLE PRECISION :: PI=4.D0*DATAN(1.D0)
      
!       lng = x / 2**z * 360 - 180
!       lat = atan(sinh(pi * (1 - 2 * y / 2**z))) * 180 / pi
      
!       get_lat_lng = lat, lng
!   END FUNCTION get_lat_lng


SUBROUTINE transform_geo(w,s,e,n, lon, lat, extent, ret)
    implicit none
    
    DOUBLE PRECISION :: w,s,e,n,lon,lat,extent
    DOUBLE PRECISION :: x,y 
    DOUBLE PRECISION,dimension(2),intent(out) :: ret
       ! uk lat = 51 lon = 0.1
       ! east west = lon 
    x =  ((lon - w) / ( e - w )) * extent
    y =  ((lat - n) / ( s - n )) * extent

    ret = (/x,y/)

END SUBROUTINE



SUBROUTINE tilecoord (z,x,y,lat_deg,lng_deg)
! 
implicit none
DOUBLE PRECISION :: z,x,y
DOUBLE PRECISION :: z2,lat_rad
DOUBLE PRECISION,intent(out) ::lat_deg, lng_deg
DOUBLE PRECISION :: PI=4.D0*DATAN(1.D0)

!f2py intent(in) z,x,y
!f2py REAL*8 intent(out) lng_deg,lat_deg

z2 = 2 ** z
lng_deg = x / z2 * 360.0 - 180.0
lat_rad = atan(sinh(PI * (1. - 2. * y / z2)))
lat_deg = lat_rad * 180.0 / pi

return 
END SUBROUTINE


SUBROUTINE tile2all (z,x,y,gx,gy,lon,lat)
      implicit none
      DOUBLE PRECISION z,x,y,gx,gy,extent,t_size,x0,y0,y2
      DOUBLE PRECISION, intent(out) :: lon,lat
      DOUBLE PRECISION :: PI=4.D0*DATAN(1.D0)
      extent = 4096.
      t_size = extent*2.**z
      x0 = extent*x
      y0 = extent*y

      y2 = 180. - (gy-y0) * 360.0 / t_size
      lon = (gx + x0) * 360.0 / t_size - 180.0
      lat = 360.0 / PI * atan(exp(y2 * PI / 180.0)) - 90. 
      
      return 
END SUBROUTINE

SUBROUTINE ll2vt (lon,lat,z,x,y,extent,ret)
  ! NB mapbox tile creator doubles the geometry 
  ! https://docs.mapbox.com/data/tilesets/guides/vector-tiles-standards/
      implicit none
      DOUBLE PRECISION lon,lat,rsin,z2,x0,z
      DOUBLE PRECISION :: x, y 
      DOUBLE PRECISION, dimension (2),intent(out) :: ret
      DOUBLE PRECISION :: PI=4.D0*DATAN(1.D0)
      DOUBLE PRECISION :: extent 

      ! uk lat = 51 lon = 0.1
    ! print *, lon,lat,x,y,z,extent
      rsin = sin( lat * PI/180.)
      z2   = 2. ** z
      x0 = z2 * (lon / 360 + 0.5)
      y = ((z2 * (0.5 - 0.25 * log((1 + rsin) / (1 - rsin)) / pi)) / y ) * extent/2.


      x0 = mod(x0, z2)
      if (x<0.) x0 = x0 + z2
      
      x = (x0/x) * extent/2.

      ret = (/x,y/)
      return 
END SUBROUTINE



! FUNCTION pointToTileFraction(lon, lat, z) 
!       IMPLICIT NONE
!       INTEGER, PARAMETER :: pi = 3.141592653589793
!       REAL(KIND=8) :: lon, lat, z, rsin, z2, x, y
!       rsin = sin(lat * pi/180)
!       z2 = 2**z
!       x = z2 * (lon / 360 + 0.5)
!       y = z2 * (0.5 - 0.25 * log((1 + rsin) / (1 - rsin)) / pi)
    
!       ! // Wrap Tile X
!       x = MOD(x, z2)
!       IF (x < 0) THEN
!         x = x + z2
!       END IF
!       pointToTileFraction = [x, y, z]
!     END FUNCTION pointToTileFraction










! SUBROUTINE inpoly(x,y,poly,inside)

! implicit none
! !     Check if a point is inside a polygon using the raycast method
!       REAL*8 :: x,y
!       REAL*8 x2,y2,x1,y1,xints
!       REAL*8 poly(:,:)
!       INTEGER N,i
!       LOGICAL, intent(out):: inside 
!       integer, dimension(:), allocatable :: pshape

!       inside = .FALSE.
!       pshape = shape(poly)
!       n = size(poly)
          
!       !f2py intent(in) x,y,poly 
!       !f2py LOGICAL intent(out) inside


! x2=0.
! y2=0.
! xints=0.

! x1 = poly(pshape(1),1)
! y1 = poly(pshape(1),2)

! do i = 1, pshape(1)+1, 1 
      
!       x2 = poly(i,1)
!       y2 = poly(i,2)  
      

!       ! print*, x,y,x2,y2,\n'

!       if (((y2 > y) .neqv. (y1 > y)) .and. (x < ((x1 - x2) * (x - x2) / (y1 - y2)) + y1)) then
!                   print*, 'find', inside
!                   inside = .not. inside
!       end if 




!       x1 = x2
!       y1 = y2

!       ! if (y > MIN(y1,y2)) then
!       !       if (y <= MAX(y1,y2)) then
!       !             if (x <= MAX(x1,x2)) then
!       !                   if (y1 .NE. y2) then 
!       !                         xints = (y-y1)*(x2-x1)/(y2-y1)+x1
!       !                   end if
!       !                   if ((x1 .EQ. x2) .or. (x<= xints)) then 
!       !                         inside = .not. inside
!       !                         print *, inside, \n
                              
!       !                   end if 
!       !             end if
!       !      
!       !       end if
!       ! end if

!    end do
!    print*, 'final', inside

! RETURN
! END SUBROUTINE


! f2py -c a.f90 -m madd && ipython -c 'import madd;madd.inpoly(1.2,1.4,[[0,2],[0,3]])'





SUBROUTINE point_in_polygon(px,py,x,y,inside)
      implicit none
    
      real*8 :: x(:),y(:)   ! Coordinates of the vertices
      real*8 :: px, py                ! Coordinates of the point to be tested
      integer :: i, cn ,n         ! Loop variables and crossing number
      logical, intent(out):: inside 


      ! Initialize the crossing number to zero
      cn = 0
      n = size(x)

      ! Loop through all the vertices of the polygon
      do i = 1, n
        ! Check if the point is on the same side of the edge as the reference point
        if ((y(i) > py) .neqv. (y(mod(i,n)+1) > py)) then
          ! If the point is on the same side, check if it crosses the edge
          if (px < (x(mod(i,n)+1) - x(i)) * (py - y(i)) / (y(mod(i,n)+1) - y(i)) + x(i)) then
            ! If the point crosses the edge, increment the crossing number
            cn = cn + 1
          endif
        endif
      end do
    
      ! ! Check if the crossing number is odd or even
      ! if (mod(cn,2) .eq. 1) then
      !   ! If the crossing number is odd, the point is inside the polygon
      !   print *, "Point is inside the polygon."
      ! else
      !   ! If the crossing number is even, the point is outside the polygon
      !   print *, "Point is outside the polygon."
      ! endif
    
      inside  = (mod(cn,2) .eq. 1)


END SUBROUTINE point_in_polygon