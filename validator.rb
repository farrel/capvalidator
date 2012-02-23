require 'rubygems'
require 'sinatra'
require 'rcap'
require 'haml'
require 'coderay'
require 'rexml/formatters/pretty'

XML_FORMATTER = REXML::Formatters::Pretty.new( 2 )
XML_FORMATTER.compact = true

get '/' do
  haml( :index )
end


post '/validate' do
  begin
    @alert = RCAP::Alert.from_xml( params[ :cap_data ] )
    if @alert.valid?
      @xml_string = ""
      XML_FORMATTER.write( @alert.to_xml_document, @xml_string ) 
      haml( :validate )
    else
      haml( :error )
    end
  rescue => exception
    @alert = nil
    @exception = exception
    haml( :error )
  end
end

helpers do
  include Rack::Utils
  alias_method( :h, :escape_html )

  def cycle
    @_cycle ||= reset_cycle
    @_cycle = [@_cycle.pop] + @_cycle
    @_cycle.first
  end

  def current_cycle
    @_cycle.first
  end

  def reset_cycle
    @_cycle = %w(even odd)
  end
end
